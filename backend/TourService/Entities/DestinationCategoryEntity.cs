
namespace TourService.Entities
{
    public class DestinationCategoryEntity
    {
        public Guid DestinationId { get; set; }
        public DestinationEntity? Destination { get; set; }

        public Guid CategoryId { get; set; }
        public CategoryEntity? Category { get; set; }
    }
}