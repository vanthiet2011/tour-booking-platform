using System.ComponentModel.DataAnnotations;

namespace BookingService.Entities
{
    public class BookingDetailEntity
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public BookingEntity? Booking { get; set; }

        [Required]
        [MaxLength(100)]
        public string? TravelerName { get; set; }

        public DateTime TravelerDOB { get; set; } // Ngày sinh của khách
    }
}