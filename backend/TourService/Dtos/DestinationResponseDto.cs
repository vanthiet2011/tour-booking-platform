namespace TourService.Dtos
{
    public class DestinationResponseDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? Region { get; set; }
        public bool IsPopular { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<CategoryDto> Categories { get; set; } = new();
    }
}