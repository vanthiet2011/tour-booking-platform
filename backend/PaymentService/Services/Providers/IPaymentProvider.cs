using PaymentService.Dtos;
using PaymentService.Entities;
using PaymentService.Enums;

public interface IPaymentProvider
{
    PaymentMethod Method { get; }
    Task<string> GeneratePaymentLinkAsync(PaymentEntity payment, string ipAddress);
    Task<PaymentCallbackResult> ProcessCallbackAsync(PaymentEntity payment,object callbackData);
}