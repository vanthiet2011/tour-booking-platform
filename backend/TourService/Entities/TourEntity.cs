using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    [Table("Tours")]
    public class TourEntity
    {
        [Key]
        public Guid TourId { get; set; }

        [Required]
        [MaxLength(200)]
        public string? Title { get; set; }

        [Column(TypeName = "text")]
        public string? Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }

        public int Capacity { get; set; }

        public int Duration { get; set; } // Duration in days

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<ReviewEntity> Reviews { get; set; } = new List<ReviewEntity>();

        // Navigation property for the many-to-many relationship
        public ICollection<TourDestinationEntity> TourDestinations { get; set; } = new List<TourDestinationEntity>();

        // Navigation property for the one-to-many relationship
        public ICollection<TourScheduleEntity> TourSchedules { get; set; } = new List<TourScheduleEntity>();
    }
}