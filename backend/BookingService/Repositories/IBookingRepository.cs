using BookingService.Entities;

namespace BookingService.Repositories;

public interface IBookingRepository
{
    Task AddAsync(BookingEntity booking);
    Task<BookingEntity?> GetByIdAsync(Guid id);
    Task<IEnumerable<BookingEntity>> GetByUserIdAsync(Guid userId);
    Task<bool> UpdateAsync(BookingEntity entity);
    Task<BookingEntity?> GetByIdWithDetailsAsync(Guid id);
    Task<(IEnumerable<BookingEntity> Items, int TotalCount)> GetAllPaginatedAsync(int page, int pageSize);
    Task<IEnumerable<BookingEntity>> GetExpiredPendingBookingsAsync(DateTime expirationTime);
    Task<bool> HasCompletedBookingAsync(Guid userId, Guid tourId);

}