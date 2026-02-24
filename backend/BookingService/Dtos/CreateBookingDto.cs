using System.ComponentModel.DataAnnotations;
using BookingService.Enums;

namespace BookingService.Dtos;
public class CreateBookingDto
{
    [Required]
    public Guid TourDepartureId { get; set; }

    [Required(ErrorMessage = "Họ tên người liên hệ là bắt buộc.")]
    [MaxLength(100)]
    public string ContactFullName { get; set; } = null!;

    [Required(ErrorMessage = "Số điện thoại là bắt buộc.")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    [MaxLength(20)]
    public string ContactPhone { get; set; } = null!;

    [Required(ErrorMessage = "Email là bắt buộc.")]
    [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ.")]
    [MaxLength(100)]
    public string ContactEmail { get; set; } = null!;

    [Required(ErrorMessage = "Địa chỉ là bắt buộc.")]
    [MaxLength(200)]
    public string ContactAddress { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Note { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Phải có ít nhất một chi tiết đặt tour.")]
    public List<ParticipantCountDto> BookingDetails { get; set; } = new List<ParticipantCountDto>();

    [Required]
    public string PaymentMethod { get; set; } = "AtOffice";
}