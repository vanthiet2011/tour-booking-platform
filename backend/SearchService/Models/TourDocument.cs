using System;

namespace SearchService.Models
{
    public class TourDocument
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public List<string> Destinations { get; set; } = new();
        public int AvailableSlots { get; set; }
        public List<string> Tags { get; set; } = new();
    }
}
