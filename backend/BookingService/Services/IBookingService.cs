using BookingService.Dtos;
using BookingService.Entities;
using BookingService.Enums;
using BookingService.Events;

namespace BookingService.Services;

public interface IBookingService
{
    Task<BookingEntity> CreateBookingAsync(Guid userId, CreateBookingDto dto);
    Task<BookingEntity?> GetBookingByIdAsync(Guid id);
    Task<IEnumerable<BookingResponseDto>> GetBookingsByUserIdAsync(Guid userId);
    Task UpdateBookingPaymentLinkAsync(Guid bookingId, string paymentLink);
    Task UpdateBookingStatusAsync(Guid bookingId, BookingStatus newStatus, string? reason = null);
    Task HandlePaymentFailureAsync(PaymentFailedEvent failureEvent);
}