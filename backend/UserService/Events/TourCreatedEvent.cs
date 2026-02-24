using System;

namespace UserService.Events
{
    public class TourCreatedEvent
    {
        public Guid TourId { get; set; }
        public string? Name { get; set; }
        public string? Region { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}