using System.ComponentModel.DataAnnotations;
using TourService.Models;

namespace TourService.Dtos
{
    public class UpdateTourDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        public int Capacity { get; set; }

        [MaxLength(50)]
        public string? Duration { get; set; }

        public bool IsBestseller { get; set; }

        public string? ImageUrl { get; set; }

        public List<Guid> DestinationIds { get; set; } = new List<Guid>();

        public List<TourScheduleDto> Schedules { get; set; } = new List<TourScheduleDto>();
        public List<string> Highlights { get; set; } = new();
        public List<string> GalleryImages { get; set; } = new();
        public Inclusions Inclusions { get; set; } = new();
    }
}