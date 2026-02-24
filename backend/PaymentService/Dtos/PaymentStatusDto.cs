namespace PaymentService.Dtos
{
    public class PaymentStatusDto
    {
        public Guid BookingId { get; set; }
        public Guid PaymentId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? PaymentLink { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
