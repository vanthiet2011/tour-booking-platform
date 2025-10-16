using BookingService.Enums;

namespace BookingService.Dtos;

public class BookingDetailResponseDto
{
  public ParticipantType ParticipantType { get; set; }
  public int Quantity { get; set; }
  public decimal UnitPrice { get; set; }
}