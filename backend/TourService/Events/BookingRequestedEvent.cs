using TourService.Enums;

namespace TourService.Events;

public class BookingRequestedEvent
{
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public Guid TourId { get; set; }
    public Guid TourDepartureId { get; set; }
    public decimal TotalPrice { get; set; }

    public string ContactFullName { get; set; } = default!;
    public string ContactPhone { get; set; } = default!;
    public string ContactEmail { get; set; } = default!;
    public string ContactAddress { get; set; } = default!;

    public List<BookingParticipantInfo> Participants { get; set; } = new();
}

public class BookingParticipantInfo
{
    public ParticipantType Type { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
