// Entities/TourEntity.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TourService.Models;

namespace TourService.Entities
{
    [Table("Tours")]
    public class TourEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty; // Sửa từ Title

        [Column(TypeName = "text")]
        public string? Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal PricePerAdult { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal PricePerChild { get; set; }

        [MaxLength(256)]
        public string? ImageUrl { get; set; }

        [MaxLength(50)]
        public string? Duration { get; set; }

        public bool IsBestseller { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<string> Highlights { get; set; } = new();
        public List<string> GalleryImages { get; set; } = new();
        public Inclusions? Inclusions { get; set; }
        
        public ICollection<ReviewEntity> Reviews { get; set; } = new List<ReviewEntity>();
        public ICollection<TourDestinationEntity> TourDestinations { get; set; } = new List<TourDestinationEntity>();
        public ICollection<TourScheduleEntity> TourSchedules { get; set; } = new List<TourScheduleEntity>();
        public ICollection<TourDepartureEntity> TourDepartures { get; set; } = new List<TourDepartureEntity>();
    }
}