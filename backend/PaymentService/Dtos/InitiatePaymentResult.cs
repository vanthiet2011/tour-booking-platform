public class InitiatePaymentResult
{
    public Guid PaymentId { get; init; }
    public string PaymentLink { get; init; } = default!;
}
