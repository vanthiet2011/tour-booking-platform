// Trong thư mục Dtos/CreateTourDto.cs
using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos
{
    public class CreateTourDto
    {
        [Required]
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Capacity { get; set; }

        [Required]
        public int Duration { get; set; }

        // Danh sách các ID của Destination mà tour này đi qua
        [Required]
        public List<Guid> DestinationIds { get; set; } = new();

        // Danh sách các lịch trình cho tour này
        [Required]
        public List<TourScheduleDto> Schedules { get; set; } = new();
    }
}