// File: TourService/Dtos/CreateCategoryDto.cs (TẠO MỚI)
using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos
{
    public class CreateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string? Name { get; set; }
    }
}