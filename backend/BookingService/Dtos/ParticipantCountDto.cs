using System.ComponentModel.DataAnnotations;
using BookingService.Enums;

namespace BookingService.Dtos;

public class ParticipantCountDto
{
    [Required(ErrorMessage = "Loại người tham gia là bắt buộc.")]
    public ParticipantType ParticipantType { get; set; }

    [Range(0, 100, ErrorMessage = "Số lượng phải từ 0 đến 100.")]
    public int Quantity { get; set; }
}