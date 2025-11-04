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
    private readonly IKafkaProducerService _kafkaProducerService;
    private readonly IMapper _mapper;
    private readonly ILogger<BookingService> _logger;

    public BookingService(
        IBookingRepository bookingRepository,
        ITourServiceClient tourServiceClient,
        IKafkaProducerService kafkaProducerService,
        IMapper mapper,
        ILogger<BookingService> logger)
    {
        _bookingRepository = bookingRepository;
        _tourServiceClient = tourServiceClient;
        _kafkaProducerService = kafkaProducerService;
        _mapper = mapper;
        _logger = logger;
    }

     public async Task<BookingEntity> CreateBookingAsync(Guid userId, CreateBookingDto createBookingDto)
    {
        var departure = await _tourServiceClient.GetTourDepartureAsync(createBookingDto.TourDepartureId)
        ?? throw new InvalidOperationException($"Không tìm thấy chuyến đi {createBookingDto.TourDepartureId}");

        var pricing = await _tourServiceClient.GetTourPricingAsync(departure.TourId)
        ?? throw new InvalidOperationException($"Không tìm thấy giá cho tour {departure.TourId}");

        var booking = _mapper.Map<BookingEntity>(createBookingDto);
        booking.Id = Guid.NewGuid();
        booking.UserId = userId;
        booking.TourId = departure.TourId;
        booking.TourDepartureId = createBookingDto.TourDepartureId;
        booking.StartDate = departure.StartDate;
        booking.EndDate = departure.EndDate;

        BookingHelper.PopulateBookingDetailsAndTotal(booking, createBookingDto, pricing);

        await _bookingRepository.AddAsync(booking);

        var eventData = _mapper.Map<BookingRequestedEvent>(booking);
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
            PaymentLink = b.PaymentLink,
            Details = b.BookingDetails.Select(d => new BookingDetailResponseDto
            {
                ParticipantType = d.ParticipantType,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToList()
        }).ToList();
        return bookingDtos;
    }

    public async Task UpdateBookingPaymentLinkAsync(Guid bookingId, string paymentLink)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);

        if (booking == null)
        {
            _logger.LogWarning("Không tìm thấy BookingId: {BookingId} để cập nhật PaymentLink.", bookingId);
            return;
        }
        if (booking.Status == BookingStatus.Pending)
        {
            booking.PaymentLink = paymentLink;
            booking.UpdatedAt = DateTime.UtcNow;

            await _bookingRepository.UpdateAsync(booking);
            _logger.LogInformation("✅ Đã cập nhật PaymentLink cho BookingId: {BookingId}", bookingId);
        }
        else
        {
            _logger.LogWarning("⚠️ Bỏ qua cập nhật PaymentLink cho BookingId: {BookingId} vì trạng thái là {Status} (không phải Pending).",
                bookingId, booking.Status);
        }
    }
    
    public async Task UpdateBookingStatusAsync(Guid bookingId, BookingStatus newStatus, string? reason = null)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);

        if (booking == null)
        {
            _logger.LogWarning("Không tìm thấy BookingId: {BookingId} để cập nhật trạng thái sang {NewStatus}.", 
                bookingId, newStatus);
            return;
        }

        var oldStatus = booking.Status;

        if (oldStatus == BookingStatus.Confirmed || oldStatus == BookingStatus.Cancelled || oldStatus == BookingStatus.Failed)
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

        await _bookingRepository.UpdateAsync(booking);
        _logger.LogInformation("🔄 Đã cập nhật trạng thái BookingId: {BookingId} từ {OldStatus} sang {NewStatus}. Lý do: {Reason}",
            bookingId, oldStatus, newStatus, reason ?? "N/A");
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
        }
    }
}
