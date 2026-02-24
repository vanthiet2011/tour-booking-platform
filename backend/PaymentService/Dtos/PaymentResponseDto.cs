using PaymentService.Enums;

namespace PaymentService.Dtos;

public class PaymentResponseDto
{
    public Guid PaymentId { get; set; }
    public string? PaymentUrl { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
