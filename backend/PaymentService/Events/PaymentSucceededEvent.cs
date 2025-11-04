namespace PaymentService.Events
{
    public class PaymentSucceededEvent
    {
        public Guid BookingId { get; set; }
        public Guid PaymentId { get; set; }
        public string TransactionId { get; set; } = string.Empty;
    }
}