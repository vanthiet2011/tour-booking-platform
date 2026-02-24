
using PaymentService.Dtos;
using PaymentService.Entities;
using PaymentService.Enums;
using PaymentService.Events;

namespace PaymentService.Services;

public interface IPaymentService
{
  Task<PaymentEntity> ProcessPaymentDirectlyAsync(SlotsReservedEvent eventData);

  Task<PaymentStatusDto?> GetPaymentStatusByBookingIdAsync(Guid bookingId);
  Task<PaymentStatusDto?> GetPaymentStatusByIdAsync(Guid paymentId);
  Task<bool> CompletePaymentAsync(Guid paymentId, PaymentMethod method, object callbackData);
}