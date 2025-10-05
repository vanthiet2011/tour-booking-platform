// Trong thư mục Dtos/TourScheduleDto.cs
using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos
{
    public class TourScheduleDto
    {
        public Guid? ScheduleId { get; set; } // Nullable khi tạo mới

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int SeatsAvailable { get; set; }
    }
}