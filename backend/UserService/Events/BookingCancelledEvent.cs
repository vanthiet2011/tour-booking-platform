namespace UserService.Events;
public class BookingCancelledEvent
{
    public Guid BookingId { get; set; }
    public DateTime CancelledAt { get; set; } = DateTime.UtcNow;
}