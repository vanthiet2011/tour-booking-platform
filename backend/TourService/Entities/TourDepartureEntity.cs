// TourService/Entities/TourDepartureEntity.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    public class TourDepartureEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid TourId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int AvailableSlots { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("TourId")]
        public TourEntity? Tour { get; set; }
    }
}