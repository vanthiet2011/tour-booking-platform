namespace BookingService.Events;

public record SlotsFailedEvent
{
    public Guid BookingId { get; init; }
    public string Reason { get; init; } = string.Empty;
}