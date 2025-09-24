using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    public class TourEntity
    {
      public Guid Id { get; set; }
      [Required]
      [MaxLength(200)]
      public string? Title { get; set; }
      public string? Description { get; set; }
      [MaxLength(150)]
      public string? Location { get; set; }
      [Column(TypeName = "decimal(18, 2)")]
      public decimal Price { get; set; }
      public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
      public ICollection<TourScheduleEntity> Schedules { get; set; } = new List<TourScheduleEntity>();
      public ICollection<ReviewEntity> Reviews { get; set; } = new List<ReviewEntity>();
    }
}