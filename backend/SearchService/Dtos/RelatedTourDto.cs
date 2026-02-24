using System;
using System.Collections.Generic;

namespace SearchService.Dtos
{
    public class RelatedTourDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal PricePerAdult { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public int AvailableSlots { get; set; }
        // Optional: Map other fields if available in TourDocument
        public List<DestinationDto> Destinations { get; set; } = new();
    }

    public class DestinationDto
    {
        public string Name { get; set; } = string.Empty;
    }
}
