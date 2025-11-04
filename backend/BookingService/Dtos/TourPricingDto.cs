namespace BookingService.Dtos;

public class TourPricingDto
{
    public Guid TourId { get; set; }
    public decimal PricePerAdult { get; set; }
    public decimal PricePerChild { get; set; }
}
