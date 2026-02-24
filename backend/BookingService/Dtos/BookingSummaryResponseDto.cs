namespace BookingService.Dtos;

public class BookingSummaryResponseDto
{
    public Guid Id { get; set; }
    public Guid TourId { get; set; }
    public string TourName { get; set; } = null!;
    public string? ContactFullName { get; set; }
    public string? ContactEmail { get; set; }
    public string? Status { get; set; }
    public decimal TotalPrice { get; set; }
    public string? PaymentMethod { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Adults { get; set; }
    public int Children { get; set; }
    public int Infants { get; set; }
}