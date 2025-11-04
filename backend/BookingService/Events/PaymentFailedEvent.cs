namespace BookingService.Events
{
    public class PaymentFailedEvent
    {
        public Guid BookingId { get; set; }
        public Guid PaymentId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}