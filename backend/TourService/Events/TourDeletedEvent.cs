using System;

namespace TourService.Events
{
    public class TourDeletedEvent
    {
        public Guid TourId { get; set; }
        public DateTime DeletedAt { get; set; }
    }
}
