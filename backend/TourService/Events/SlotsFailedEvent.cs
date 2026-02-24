namespace TourService.Events
{
    public class SlotsFailedEvent
    {
        public Guid BookingId { get; set; }
        public string? Reason { get; set; }
    }
}