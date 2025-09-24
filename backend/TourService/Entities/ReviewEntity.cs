// backend/TourService/Entities/Review.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    public class ReviewEntity
    {
      public Guid Id { get; set; }
      public Guid UserId { get; set; }
      public Guid TourId { get; set; }
      public TourEntity? Tour { get; set; }
      [Range(1, 5)]
      public int Rating { get; set; }
      public string? Comment { get; set; }
      public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}