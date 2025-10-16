using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookingService.Enums;

namespace BookingService.Entities;

[Table("Bookings")]
public class BookingEntity
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid TourDepartureId { get; set; }

    [Required]
    public BookingStatus Status { get; set; }

    [Required]
    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalPrice { get; set; }

    [Required]
    [MaxLength(100)]
    public required string ContactFullName { get; set; }

    [Required]
    [MaxLength(20)]
    public required string ContactPhone { get; set; }

    [Required]
    [MaxLength(100)]
    public required string ContactEmail { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BookingDetailEntity> BookingDetails { get; set; } = new List<BookingDetailEntity>();
}