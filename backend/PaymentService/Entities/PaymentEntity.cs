using PaymentService.Enums; // <-- Thêm Enum
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentService.Entities
{
    public class PaymentEntity
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid BookingId { get; set; }
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }
        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        [Required]
        public PaymentMethod PaymentMethod { get; set; }
        [MaxLength(255)]
        public string? PaymentIntentId { get; set; } 
        [Column(TypeName = "text")]
        public string? PaymentLink { get; set; }
        [MaxLength(255)]
        public string? PaymentGatewayTransactionId { get; set; }
        [Column(TypeName = "text")]
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        [MaxLength(100)]
        public DateTime? ExpiresAt { get; set; }
    }
}