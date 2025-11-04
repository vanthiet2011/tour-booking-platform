namespace BookingService.Events;

// Event này TourService gửi về khi giữ chỗ thành công
public record SlotsReservedEvent
{
    public Guid BookingId { get; init; }
}