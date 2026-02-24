namespace UserService.Dtos
{
  public class RecentBookingDto {
      public string BookingId { get; set; } = string.Empty;
      public string CustomerName { get; set; } = string.Empty;
      public decimal TotalPrice { get; set; }
      public string Status { get; set; } = string.Empty;
      public DateTime CreatedAt { get; set; }
  }
}