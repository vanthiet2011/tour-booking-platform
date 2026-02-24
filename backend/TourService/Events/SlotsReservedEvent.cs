namespace TourService.Events
{
    public class SlotsReservedEvent
    {
        public Guid BookingId { get; set; }
        public Guid TourId { get; set; }
        public Guid DepartureId { get; set; }
        public decimal TotalPrice { get; set; }
        public string PaymentMethod { get; set; } = "AtOffice";
        public string IpAddress { get; set; } = "127.0.0.1";
    }
}