using BookingService.Enums;

namespace BookingService.Events;

public class ParticipantCountInfo
{
    public ParticipantType Type { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}