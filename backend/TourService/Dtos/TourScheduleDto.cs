// Dtos/TourScheduleDto.cs

using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos
{
    public class TourScheduleDto
    {
        [Required]
        public int DayNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}