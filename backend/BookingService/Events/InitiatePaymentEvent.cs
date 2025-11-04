namespace PaymentService.Events
{
    public class InitiatePaymentEvent
    {
        public Guid BookingId { get; set; }
        public Guid PaymentId { get; set; }
        public string PaymentLink { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
    }
}