// Trong thư mục Dtos/UpdateTourDto.cs
using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos
{
    public class UpdateTourDto
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
        [Required]
        public List<Guid> DestinationIds { get; set; } = new();
    }
}