using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    [Table("Reviews")]
    public class ReviewEntity
    {
        [Key]
        public Guid ReviewId { get; set; }

        [Required]
        public Guid UserId { get; set; } // ID của người dùng viết review

        [Required]
        public Guid TourId { get; set; }

        [Required]
        [Range(1, 5)] // Đảm bảo rating từ 1 đến 5 sao
        public int Rating { get; set; }

        [Column(TypeName = "text")]
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property đến Tour
        [ForeignKey("TourId")]
        public TourEntity? Tour { get; set; }
    }
}