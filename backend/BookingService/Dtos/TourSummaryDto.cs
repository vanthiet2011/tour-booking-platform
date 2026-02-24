namespace BookingService.Dtos;
public class TourSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int MaxParticipants { get; set; }
}