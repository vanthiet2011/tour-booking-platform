namespace BookingService.Events
{
    public class BookingCompletedEvent
    {
        public Guid BookingId { get; set; }
        public Guid UserId { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    }
}