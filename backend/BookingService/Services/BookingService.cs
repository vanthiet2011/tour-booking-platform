using BookingService.Dtos;
using BookingService.Entities;
using BookingService.Enums;
using BookingService.Repositories;

namespace BookingService.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ITourServiceClient _tourServiceClient;

    public BookingService(IBookingRepository bookingRepository, ITourServiceClient tourServiceClient)
    {
        _bookingRepository = bookingRepository;
        _tourServiceClient = tourServiceClient;
    }

    public async Task<BookingEntity> CreateBookingAsync(Guid userId, CreateBookingDto createBookingDto)
    {
        var departureDetails = await _tourServiceClient.GetTourDepartureDetailsAsync(createBookingDto.TourDepartureId);
        if (departureDetails == null)
        {
            throw new InvalidOperationException($"Không tìm thấy thông tin cho chuyến đi có mã: {createBookingDto.TourDepartureId}");
        }

        var bookingEntity = new BookingEntity
        {
            UserId = userId,
            TourDepartureId = createBookingDto.TourDepartureId,
            Status = BookingStatus.Pending,
            ContactFullName = createBookingDto.ContactFullName,
            ContactEmail = createBookingDto.ContactEmail,
            ContactPhone = createBookingDto.ContactPhone,
            Note = createBookingDto.Note,
        };

        decimal totalPrice = 0;
        foreach (var detail in createBookingDto.BookingDetails)
        {
            decimal unitPrice = detail.ParticipantType switch
            {
                ParticipantType.Adult => departureDetails.AdultPrice,
                ParticipantType.Child => departureDetails.ChildPrice,
                ParticipantType.Infant => 0,
                _ => 0
            };

            if (detail.Quantity > 0)
            {
                bookingEntity.BookingDetails.Add(new BookingDetailEntity
                {
                    ParticipantType = detail.ParticipantType,
                    Quantity = detail.Quantity,
                    UnitPrice = unitPrice
                });
                totalPrice += unitPrice * detail.Quantity;
            }
        }
        bookingEntity.TotalPrice = totalPrice;

        await _bookingRepository.AddAsync(bookingEntity);

        return bookingEntity;
    }

    public async Task<BookingEntity?> GetBookingByIdAsync(Guid id)
    {
        return await _bookingRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<BookingEntity>> GetBookingsByUserIdAsync(Guid userId)
    {
        return await _bookingRepository.GetByUserIdAsync(userId);
    }
}