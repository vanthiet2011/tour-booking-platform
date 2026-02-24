namespace BookingService.Events;
public class BookingFailedEvent
{
    public Guid BookingId { get; set; }
    public string? Reason { get; set; }
    public DateTime FailedAt { get; set; } = DateTime.UtcNow;
}