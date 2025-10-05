using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    [Table("TourSchedules")]
    public class TourScheduleEntity
    {
        [Key]
        public Guid ScheduleId { get; set; }

        [Required]
        public Guid TourId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public int SeatsAvailable { get; set; }

        // Navigation property to the parent Tour
        [ForeignKey("TourId")]
        public TourEntity? Tour { get; set; }
    }
}