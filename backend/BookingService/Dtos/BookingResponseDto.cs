
namespace BookingService.Dtos;

public class BookingResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TourDepartureId { get; set; }
    public string? Status { get; set; }
    public decimal TotalPrice { get; set; }
    public string? ContactFullName { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<BookingDetailResponseDto> BookingDetails { get; set; } = new();
}