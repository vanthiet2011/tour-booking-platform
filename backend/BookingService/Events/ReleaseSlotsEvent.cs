namespace BookingService.Events;

public class ReleaseSlotsEvent
{
    public Guid BookingId { get; set; }
    public Guid TourId { get; set; }
    public Guid DepartureId { get; set; }
    public int Quantity { get; set; }
}