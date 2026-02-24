using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos;

public class CreateTourDepartureDto
{
    [Required(ErrorMessage = "Ngày khởi hành là bắt buộc")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "Ngày kết thúc là bắt buộc")]
    public DateTime EndDate { get; set; }

    [Required(ErrorMessage = "Tổng số chỗ là bắt buộc")]
    [Range(1, 1000, ErrorMessage = "Tổng số chỗ phải từ 1 đến 1000")]
    public int TotalSlots { get; set; }
}