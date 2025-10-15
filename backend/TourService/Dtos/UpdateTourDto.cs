using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TourService.Models;

namespace TourService.Dtos
{
    public class UpdateTourDto
    {
        [Required(ErrorMessage = "Tên tour là bắt buộc.")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "Giá người lớn là bắt buộc.")]
        [Range(0, double.MaxValue)]
        public decimal PricePerAdult { get; set; }

        [Required(ErrorMessage = "Giá trẻ em là bắt buộc.")]
        [Range(0, double.MaxValue)]
        public decimal PricePerChild { get; set; }

        [MaxLength(50)]
        public string? Duration { get; set; }

        public bool IsBestseller { get; set; } = false;

        public string? ImageUrl { get; set; }

        public List<string> Highlights { get; set; } = new();

        public List<string> GalleryImages { get; set; } = new();

        public Inclusions? Inclusions { get; set; }

        [Required(ErrorMessage = "Phải chọn ít nhất một điểm đến.")]
        [MinLength(1, ErrorMessage = "Phải chọn ít nhất một điểm đến.")]
        public List<Guid> DestinationIds { get; set; } = new();

        public List<TourScheduleDto> Schedules { get; set; } = new();

        [Required(ErrorMessage = "Phải có ít nhất một ngày khởi hành.")]
        [MinLength(1, ErrorMessage = "Phải có ít nhất một ngày khởi hành.")]
        public List<TourDepartureDto> TourDepartures { get; set; } = new();
    }
}