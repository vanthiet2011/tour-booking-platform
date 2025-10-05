// Trong thư mục Dtos/UpdateDestinationDto.cs
using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos
{
    public class UpdateDestinationDto
    {
        [Required]
        [MaxLength(100)]
        public string? Name { get; set; }

        public string? Description { get; set; }

        [MaxLength(256)]
        public string? ImageUrl { get; set; }

        [MaxLength(50)]
        public string? Region { get; set; }

        public bool IsPopular { get; set; }
    }
}