namespace PaymentService.Dtos;

public class PayPalCaptureRequest
{
    public Guid PaymentId { get; init; }
    public string PayPalOrderId { get; init; } = default!;
}
