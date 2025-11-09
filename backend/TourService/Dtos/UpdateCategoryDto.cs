// File: TourService/Dtos/UpdateCategoryDto.cs (TẠO MỚI)
using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos
{
    public class UpdateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string? Name { get; set; }
    }
}