// Entities/TourEntity.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        public decimal Price { get; set; }

        [MaxLength(256)]
        public string? ImageUrl { get; set; }

        [MaxLength(50)]
        public string? Duration { get; set; }

        public bool IsBestseller { get; set; } = false;

        [Required]
        public int Capacity { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<ReviewEntity> Reviews { get; set; } = new List<ReviewEntity>();
        public ICollection<TourDestinationEntity> TourDestinations { get; set; } = new List<TourDestinationEntity>();
        public ICollection<TourScheduleEntity> TourSchedules { get; set; } = new List<TourScheduleEntity>();
    }
}