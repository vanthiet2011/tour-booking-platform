using BookingService.Data;
using BookingService.Entities;
using BookingService.Enums;
using Microsoft.EntityFrameworkCore;

namespace BookingService.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly BookingDbContext _context;

    public BookingRepository(BookingDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(BookingEntity booking)
    {
        await _context.Bookings.AddAsync(booking);
        await _context.SaveChangesAsync();
    }

    public async Task<BookingEntity?> GetByIdAsync(Guid id)
    {
        return await _context.Bookings
            .Include(b => b.BookingDetails)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<IEnumerable<BookingEntity>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Bookings
            .Include(b => b.BookingDetails)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(BookingEntity entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.Bookings.Update(entity);
        return (await _context.SaveChangesAsync()) > 0;
    }

    public async Task<BookingEntity?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Bookings
            .Include(b => b.BookingDetails) 
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<(IEnumerable<BookingEntity> Items, int TotalCount)> GetAllPaginatedAsync(int page, int pageSize)
    {
        var query = _context.Bookings
            .Include(b => b.BookingDetails)
            .AsNoTracking()
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<IEnumerable<BookingEntity>> GetExpiredPendingBookingsAsync(DateTime expirationTime)
    {
        return await _context.Bookings
            .Include(b => b.BookingDetails)
            .Where(b => b.Status == BookingStatus.Pending && b.CreatedAt < expirationTime)
            .ToListAsync(); 
    }

    public async Task<bool> HasCompletedBookingAsync(Guid userId, Guid tourId)
    {
        return await _context.Bookings
            .AnyAsync(b => b.UserId == userId && 
                           b.TourId == tourId && 
                           b.Status == BookingStatus.Completed);
    }
}