// BookingService/Entities/BookingEntity.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookingService.Enums;

namespace BookingService.Entities
{
    public class BookingEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid TourDepartureId { get; set; }

        [Required]
        [MaxLength(50)]
        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalPrice { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<BookingDetailEntity> BookingDetails { get; set; } = new List<BookingDetailEntity>();
    }
}