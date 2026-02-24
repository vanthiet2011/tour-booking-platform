namespace BookingService.Events
{
    public class BookingConfirmedEvent
    {
        public Guid BookingId { get; set; }
        public Guid UserId { get; set; }
        public Guid TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public int ParticipantsCount { get; set; }
        public int TotalSlots { get; set; }
        public decimal TotalPrice { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime ConfirmedAt { get; set; } = DateTime.UtcNow;
    }
}