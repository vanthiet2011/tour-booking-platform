namespace BookingService.Dtos;

public class TourDepartureDto
{
    public Guid TourId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int AvailableSlots { get; set; }
}
