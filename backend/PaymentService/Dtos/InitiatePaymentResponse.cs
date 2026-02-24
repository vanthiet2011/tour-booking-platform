using PaymentService.Enums;

namespace PaymentService.Dtos;

public class InitiatePaymentResponse
{
    public Guid PaymentId { get; init; }
    public PaymentMethod Method { get; init; }
    public string PaymentLink { get; init; } = default!;
}
