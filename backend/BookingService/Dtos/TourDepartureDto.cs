namespace BookingService.Dtos;

public class TourDepartureDto
{
    public Guid TourId { get; set; }
    public string TourName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalSlots { get; set; }
    public int AvailableSlots { get; set; }
}
