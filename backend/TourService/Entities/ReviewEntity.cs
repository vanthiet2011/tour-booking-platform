// Entities/ReviewEntity.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    [Table("Reviews")]
    public class ReviewEntity
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid TourId { get; set; }
        public TourEntity Tour { get; set; } = null!;

        public Guid UserId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Column(TypeName = "text")]
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}