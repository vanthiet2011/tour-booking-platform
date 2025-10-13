// BookingService/Entities/BookingDetailEntity.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookingService.Enums;

namespace BookingService.Entities
{
    public class BookingDetailEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid BookingId { get; set; }
        [Required]
        [MaxLength(50)]
        public ParticipantType ParticipantType { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal UnitPrice { get; set; }
    }
}