// File: BookingService/Dtos/BookingResponseDto.cs
// ĐÃ SỬA LẠI:
namespace BookingService.Dtos;

public class BookingResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TourId { get; set; }
    public Guid TourDepartureId { get; set; }
    public string? Status { get; set; }
    public decimal TotalPrice { get; set; }
    public string? ContactFullName { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime StartDate { get; set; }
    public string? PaymentLink { get; set; }
    public List<BookingDetailResponseDto> Details { get; set; } = new();
}