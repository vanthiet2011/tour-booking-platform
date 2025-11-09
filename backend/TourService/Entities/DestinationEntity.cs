using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    [Table("Destinations")]
    public class DestinationEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string? Name { get; set; }

        [Column(TypeName = "text")]
        public string? Description { get; set; }

        [MaxLength(256)]
        public string? ImageUrl { get; set; }

        [MaxLength(50)]
        public string? Region { get; set; }

        public bool IsPopular { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<DestinationCategoryEntity> DestinationCategories { get; set; } = new List<DestinationCategoryEntity>();
        public ICollection<TourDestinationEntity> TourDestinations { get; set; } = new List<TourDestinationEntity>();
    }
}