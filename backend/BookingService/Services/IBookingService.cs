using BookingService.Dtos;
using BookingService.Entities;
using BookingService.Enums;
using BookingService.Events;

namespace BookingService.Services;

public interface IBookingService
{
    Task<PaginatedResponseDto<BookingSummaryResponseDto>> GetAllBookingsAsync(int page, int pageSize);
    Task<BookingEntity> CreateBookingAsync(Guid userId, CreateBookingDto dto, string ipAddress);
    Task<BookingEntity?> GetBookingByIdAsync(Guid id);
    Task<IEnumerable<BookingResponseDto>> GetBookingsByUserIdAsync(Guid userId);
    Task UpdateBookingStatusAsync(Guid bookingId, BookingStatus newStatus, string? reason = null, string? paymentMethod = null);
    Task CancelBookingAsync(Guid bookingId, Guid userId);
    Task CancelBookingByAdminAsync(Guid bookingId, string reason);
    Task HandlePaymentFailureAsync(PaymentFailedEvent failureEvent);
    Task<bool> HasCompletedBookingAsync(Guid userId, Guid tourId);
}