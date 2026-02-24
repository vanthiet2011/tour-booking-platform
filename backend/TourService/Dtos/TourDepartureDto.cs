// TourService/Dtos/TourDepartureDto.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos
{
    public class TourDepartureDto
    {
        public Guid Id { get; set; }
        public Guid TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalSlots { get; set; }
        [Range(0, int.MaxValue)]
        public int AvailableSlots { get; set; }
    }
}