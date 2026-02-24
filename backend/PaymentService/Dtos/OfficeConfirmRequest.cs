namespace PaymentService.Dtos
{
    public class OfficeConfirmRequest
    {
        public Guid BookingId { get; set; }
        public string? StaffId { get; set; }
    }
}