using System;
using System.Collections.Generic;

namespace SearchService.Dtos
{
    public class TourCreatedEvent
    {
        public Guid TourId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int AvailableSlots { get; set; }
        public List<string> Destinations { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }

    public class TourUpdatedEvent
    {
        public Guid TourId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int AvailableSlots { get; set; }
        public List<string> Destinations { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public DateTime UpdatedAt { get; set; }
    }

    public class TourDeletedEvent
    {
        public Guid TourId { get; set; }
        public DateTime DeletedAt { get; set; }
    }
}
