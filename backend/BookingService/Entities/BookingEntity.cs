
namespace BookingService.Entities
{
  public enum BookingStatus
  {
    Pending,
    Confirmed,
    Cancelled,
    Completed
  }

  public class BookingEntity
  {
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ScheduleId { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<BookingDetailEntity> Details { get; set; } = new List<BookingDetailEntity>();
  }
}