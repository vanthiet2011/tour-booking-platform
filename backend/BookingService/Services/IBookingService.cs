using BookingService.Dtos;
using BookingService.Entities;

namespace BookingService.Services;

public interface IBookingService
{
    Task<BookingEntity> CreateBookingAsync(Guid userId, CreateBookingDto dto);
    Task<BookingEntity?> GetBookingByIdAsync(Guid id);
    Task<IEnumerable<BookingEntity>> GetBookingsByUserIdAsync(Guid userId);
}