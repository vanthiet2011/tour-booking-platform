
using PaymentService.Dtos;
using PaymentService.Entities;
using PaymentService.Events;

namespace PaymentService.Services;

public interface IPaymentService
{
  Task<PaymentEntity> CreatePaymentSessionAsync(SlotsReservedEvent eventData);
  Task HandleWebhookPayloadAsync(WebhookPayloadDto payload);
}