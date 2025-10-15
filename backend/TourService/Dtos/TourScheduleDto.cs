
using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos
{
    public class TourScheduleDto
    {
        public Guid Id { get; set; }

        public int DayNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}