namespace PaymentService.Dtos;

public class OfficeConfirmData
{
    public string StaffId { get; init; } = default!;
    public DateTime ConfirmedAt { get; init; } = DateTime.UtcNow;
}
