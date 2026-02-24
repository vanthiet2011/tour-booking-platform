using PaymentService.Enums;

namespace PaymentService.Dtos;

public class CreatePaymentDto
{
    public Guid BookingId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string IpAddress { get; set; } = string.Empty;
}
