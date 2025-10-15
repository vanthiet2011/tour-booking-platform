using TourService.Models;

namespace TourService.Dtos;

public class TourDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PricePerAdult { get; set; }
    public decimal PricePerChild { get; set; }
    public string? ImageUrl { get; set; }
    public string? Duration { get; set; }
    public bool IsBestseller { get; set; }
    public List<string> Highlights { get; set; } = new();
    public List<string> GalleryImages { get; set; } = new();
    public Inclusions? Inclusions { get; set; }
    public List<DestinationSummaryDto> Destinations { get; set; } = new();
    public List<TourScheduleDto> Schedules { get; set; } = new();
    public List<TourDepartureDto> TourDepartures { get; set; } = new();
}

public class DestinationSummaryDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; } = string.Empty;
}