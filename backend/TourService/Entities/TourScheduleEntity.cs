// Entities/TourScheduleEntity.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    [Table("TourSchedules")]
    public class TourScheduleEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid TourId { get; set; }
        public TourEntity Tour { get; set; } = null!;

        [Required]
        public int DayNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Column(TypeName = "text")]
        public string? Description { get; set; }
    }
}