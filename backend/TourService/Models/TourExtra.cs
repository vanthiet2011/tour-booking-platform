namespace TourService.Models
{
    public record Inclusions
    {
        public List<string> Included { get; init; } = new();
        public List<string> NotIncluded { get; init; } = new();
    }
}