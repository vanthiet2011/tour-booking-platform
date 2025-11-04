namespace TourService.Events
{
    // Tin nhắn gửi đi khi không thể trừ slot
    public class SlotsFailedEvent
    {
        public Guid BookingId { get; set; }
        public string? Reason { get; set; }
    }
}