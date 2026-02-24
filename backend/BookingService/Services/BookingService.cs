using AutoMapper;
using BookingService.Dtos;
using BookingService.Entities;
using BookingService.Enums;
using BookingService.Events;
using BookingService.Helpers;
using BookingService.Kafka.Producers;
using BookingService.Repositories;


namespace BookingService.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ITourServiceClient _tourServiceClient;
    private readonly IBookingKafkaProducerService _kafkaProducerService;
    private readonly IMapper _mapper;
    private readonly ILogger<BookingService> _logger;

    public BookingService(
        IBookingRepository bookingRepository,
        ITourServiceClient tourServiceClient,
        IBookingKafkaProducerService kafkaProducerService,
        IMapper mapper,
        ILogger<BookingService> logger)
    {
        _bookingRepository = bookingRepository;
        _tourServiceClient = tourServiceClient;
        _kafkaProducerService = kafkaProducerService;
        _mapper = mapper;
        _logger = logger;
    }


    public async Task<PaginatedResponseDto<BookingSummaryResponseDto>> GetAllBookingsAsync(int page, int pageSize)
    {
        var pagedBookings = await _bookingRepository.GetAllPaginatedAsync(page, pageSize);

        var bookingDtos = _mapper.Map<IEnumerable<BookingSummaryResponseDto>>(pagedBookings.Items);
        var tourIds = bookingDtos.Select(b => b.TourId).Distinct().ToList();
        if(tourIds.Any())
        {
            var tourNames = await _tourServiceClient.GetTourNamesAsync(tourIds);
            foreach (var dto in bookingDtos)
            {
                if (tourNames.TryGetValue(dto.TourId, out var name))
                dto.TourName = name;
            }
        }

        return new PaginatedResponseDto<BookingSummaryResponseDto>(
            page, 
            pageSize, 
            pagedBookings.TotalCount, 
            bookingDtos
        );
    }
     public async Task<BookingEntity> CreateBookingAsync(Guid userId, CreateBookingDto createBookingDto, string ipAddress)
    {
        var departure = await _tourServiceClient.GetTourDepartureAsync(createBookingDto.TourDepartureId)
        ?? throw new InvalidOperationException($"Không tìm thấy chuyến đi {createBookingDto.TourDepartureId}");

        var pricing = await _tourServiceClient.GetTourPricingAsync(departure.TourId)
        ?? throw new InvalidOperationException($"Không tìm thấy giá cho tour {departure.TourId}");

        var booking = _mapper.Map<BookingEntity>(createBookingDto);
        booking.Id = Guid.NewGuid();
        booking.UserId = userId;
        booking.PaymentMethod = createBookingDto.PaymentMethod; // Ensure mapping
        booking.TourId = departure.TourId;
        booking.TourDepartureId = createBookingDto.TourDepartureId;
        booking.TourName = departure.TourName;
        booking.TotalSlots = departure.TotalSlots;

        booking.StartDate = DateTime.SpecifyKind(departure.StartDate, DateTimeKind.Utc);
        booking.EndDate = DateTime.SpecifyKind(departure.EndDate, DateTimeKind.Utc);

        BookingHelper.PopulateBookingDetailsAndTotal(booking, createBookingDto, pricing);

        await _bookingRepository.AddAsync(booking);

        var eventData = _mapper.Map<BookingRequestedEvent>(booking);
        eventData.PaymentMethod = booking.PaymentMethod ?? "AtOffice";
        eventData.IpAddress = ipAddress;
        await _kafkaProducerService.ProduceBookingRequestedAsync(eventData);

        return booking;
    }

    public async Task<BookingEntity?> GetBookingByIdAsync(Guid id)
    {
        return await _bookingRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<BookingResponseDto>> GetBookingsByUserIdAsync(Guid userId)
    {
        var bookingEntities = await _bookingRepository.GetByUserIdAsync(userId);
        var bookingDtos = bookingEntities.Select(b => new BookingResponseDto
        {
            Id = b.Id,
            UserId = b.UserId,
            TourId = b.TourId,
            TourDepartureId = b.TourDepartureId,
            Status = b.Status.ToString(),
            TotalPrice = b.TotalPrice,
            ContactFullName = b.ContactFullName,
            ContactPhone = b.ContactPhone,
            ContactEmail = b.ContactEmail,
            Note = b.Note,
            CreatedAt = b.CreatedAt,
            StartDate = b.StartDate,
            BookingDetails = b.BookingDetails.Select(d => new BookingDetailResponseDto
            {
                ParticipantType = d.ParticipantType,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToList()
        }).ToList();
        return bookingDtos;
    }
    
    public async Task UpdateBookingStatusAsync(Guid bookingId, BookingStatus newStatus, string? reason = null, string? paymentMethod = null)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);

        if (booking == null)
        {
            _logger.LogWarning("Không tìm thấy BookingId: {BookingId} để cập nhật trạng thái sang {NewStatus}.", 
                bookingId, newStatus);
            return;
        }

        var oldStatus = booking.Status;

        if (oldStatus == BookingStatus.Cancelled || oldStatus == BookingStatus.Failed || oldStatus == BookingStatus.Completed)
        {
            _logger.LogWarning("⚠️ Bỏ qua cập nhật trạng thái cho BookingId: {BookingId} vì đã ở trạng thái cuối ({OldStatus}).",
                bookingId, oldStatus);
            return;
        }

        booking.Status = newStatus;
        booking.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(reason))
        {
            booking.FailureReason = reason;
        }

        if (!string.IsNullOrEmpty(paymentMethod))
        {
            booking.PaymentMethod = paymentMethod;
        }

        await _bookingRepository.UpdateAsync(booking);
        switch (newStatus)
        {
            case BookingStatus.Confirmed:
                var confirmedEvent = _mapper.Map<BookingConfirmedEvent>(booking);
                await _kafkaProducerService.ProduceBookingConfirmedAsync(confirmedEvent);
                break;
            case BookingStatus.Completed:
                await _kafkaProducerService.ProduceBookingCompletedAsync(new BookingCompletedEvent {
                    BookingId = booking.Id, UserId = booking.UserId, CompletedAt = DateTime.UtcNow
                });
                break;
            case BookingStatus.Cancelled:
                await _kafkaProducerService.ProduceBookingCancelledAsync(new BookingCancelledEvent {
                    BookingId = booking.Id
                });
                break;
            case BookingStatus.Failed:
                await _kafkaProducerService.ProduceBookingFailedAsync(new BookingFailedEvent {
                    BookingId = booking.Id, Reason = reason
                });
                break;
        }

        _logger.LogInformation("✅ Đã cập nhật trạng thái BookingId: {BookingId} từ {OldStatus} sang {NewStatus}.", 
            bookingId, oldStatus, newStatus);
    }

    public async Task CancelBookingAsync(Guid bookingId, Guid userId)
    {
        var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId); // Need details for quantity
        if (booking == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy Booking với ID: {bookingId}");
        }

        if (booking.UserId != userId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền hủy booking này.");
        }

        if (booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled || booking.Status == BookingStatus.Failed)
        {
            throw new InvalidOperationException($"Không thể hủy booking ở trạng thái {booking.Status}");
        }

        await UpdateBookingStatusAsync(bookingId, BookingStatus.Cancelled, BookingFailureReason.UserCancelled.ToString());

        // RELEASE SLOTS LOGIC (User Cancel)
        try
        {
            int totalQuantityToRelease = booking.BookingDetails.Sum(d => d.Quantity);
            var releaseEvent = new ReleaseSlotsEvent
            {
                BookingId = booking.Id,
                TourId = booking.TourId,
                DepartureId = booking.TourDepartureId,
                Quantity = totalQuantityToRelease
            };

            await _kafkaProducerService.ProduceReleaseSlotsRequestedAsync(releaseEvent);
            _logger.LogInformation("Người dùng hủy booking {BookingId}. Đã yêu cầu release slots.", booking.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gửi sự kiện ReleaseSlotsEvent cho BookingId: {BookingId} (User Cancel)", booking.Id);
        }
    }

    public async Task CancelBookingByAdminAsync(Guid bookingId, string reason)
    {
        var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId); // Include Validation
        if (booking == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy Booking với ID: {bookingId}");
        }

        if (booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled || booking.Status == BookingStatus.Failed)
        {
             throw new InvalidOperationException($"Không thể hủy booking ở trạng thái {booking.Status}");
        }

        await UpdateBookingStatusAsync(bookingId, BookingStatus.Cancelled, reason);

        // RELEASE SLOTS LOGIC
        try
        {
            int totalQuantityToRelease = booking.BookingDetails.Sum(d => d.Quantity);
            var releaseEvent = new ReleaseSlotsEvent
            {
                BookingId = booking.Id,
                TourId = booking.TourId,
                DepartureId = booking.TourDepartureId,
                Quantity = totalQuantityToRelease
            };

            await _kafkaProducerService.ProduceReleaseSlotsRequestedAsync(releaseEvent);
            _logger.LogInformation("Admin hủy booking {BookingId}. Đã yêu cầu release slots.", booking.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gửi sự kiện ReleaseSlotsEvent cho BookingId: {BookingId} (Admin Cancel)", booking.Id);
        }
    }

    public async Task HandlePaymentFailureAsync(PaymentFailedEvent failureEvent)
    {
        var booking = await _bookingRepository.GetByIdWithDetailsAsync(failureEvent.BookingId); // Cần Include Details
        if (booking == null || booking.Status == BookingStatus.Cancelled || booking.Status == BookingStatus.Failed)
        {
            _logger.LogWarning("Bỏ qua xử lý PaymentFailedEvent cho BookingId: {BookingId}. Status hiện tại: {Status}", failureEvent.BookingId, booking?.Status);
            return;
        }
        await UpdateBookingStatusAsync(booking.Id, BookingStatus.Cancelled, failureEvent.Reason);
        try
        {
            int totalQuantityToRelease = booking.BookingDetails.Sum(d => d.Quantity);
            var releaseEvent = new ReleaseSlotsEvent
            {
                BookingId = booking.Id,
                TourId = booking.TourId,
                DepartureId = booking.TourDepartureId,
                Quantity = totalQuantityToRelease
            };

            await _kafkaProducerService.ProduceReleaseSlotsRequestedAsync(releaseEvent);
            _logger.LogInformation("Đã yêu cầu gửi sự kiện 'slots.release.requested' qua KafkaService cho BookingId: {BookingId}", booking.Id);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gửi sự kiện ReleaseSlotsEvent cho BookingId: {BookingId} sau khi thanh toán thất bại.", booking.Id);
            _logger.LogError(ex, "Lỗi khi gửi sự kiện ReleaseSlotsEvent cho BookingId: {BookingId} sau khi thanh toán thất bại.", booking.Id);
        }
    }

    public async Task<bool> HasCompletedBookingAsync(Guid userId, Guid tourId)
    {
        return await _bookingRepository.HasCompletedBookingAsync(userId, tourId);
    }
}
