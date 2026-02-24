using PaymentService.Enums;

namespace PaymentService.Dtos;

public class InitiatePaymentRequest
{
    public Guid BookingId { get; init; }
    public PaymentMethod Method { get; init; }
}
