using BookingService.Data;
using BookingService.Enums;
using Microsoft.EntityFrameworkCore;

namespace BookingService.Services;

public class BookingJobService : IBookingJobService
{
    private readonly BookingDbContext _dbContext;
    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingJobService> _logger;

    public BookingJobService(
        BookingDbContext dbContext,
        IBookingService bookingService,
        ILogger<BookingJobService> logger)
    {
        _dbContext = dbContext;
        _bookingService = bookingService;
        _logger = logger;
    }

    public async Task CheckAndCompleteBookings()
    {
        _logger.LogInformation("🔍 Hangfire Job: Checking for bookings to complete...");

        try
        {
            var expiredBookings = await _dbContext.Bookings
                .Where(b => b.Status == BookingStatus.Confirmed && b.EndDate < DateTime.UtcNow)
                .ToListAsync();

            if (!expiredBookings.Any())
            {
                _logger.LogInformation("✅ No bookings found eligible for completion.");
                return;
            }

            foreach (var booking in expiredBookings)
            {
                await _bookingService.UpdateBookingStatusAsync(booking.Id, BookingStatus.Completed);
                _logger.LogInformation("✅ Job: Booking {Id} marked as Completed.", booking.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error executing CheckAndCompleteBookings job.");
        }
    }
}
