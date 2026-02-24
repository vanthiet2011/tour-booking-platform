namespace PaymentService.Events
{
    public class PaymentCreatedEvent
    {
        public Guid BookingId { get; set; }
        public Guid PaymentId { get; set; }
    }
}