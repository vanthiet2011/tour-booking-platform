namespace TourService.Dtos;
public class TourListDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? ImageUrl { get; set; }
    public string? Duration { get; set; }
    public bool IsBestseller { get; set; }
    public decimal PricePerAdult { get; set; }
    public List<DestinationSummaryDto> Destinations { get; set; } = new();
    public int AvailableSlots { get; set; }
}

