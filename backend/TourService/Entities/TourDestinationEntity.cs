using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    [Table("TourDestinations")]
    public class TourDestinationEntity
    {
        // Foreign keys that make up the composite primary key
        public Guid TourId { get; set; }
        public Guid DestinationId { get; set; }

        // Navigation properties to the principal entities
        public TourEntity? Tour { get; set; }
        public DestinationEntity? Destination { get; set; }
    }
}