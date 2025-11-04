namespace PaymentService.Events
{
    public class SlotsReservedEvent
    {
        public Guid BookingId { get; set; }
        public Guid TourId { get; set; }
        public Guid DepartureId { get; set; }
        public decimal TotalPrice { get; set; }
    }
}