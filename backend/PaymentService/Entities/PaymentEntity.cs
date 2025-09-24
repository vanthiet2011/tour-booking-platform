using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentService.Entities
{
    public enum PaymentStatus
    {
        Pending,
        Success,
        Failed
    }
    
    public enum PaymentMethod
    {
        CreditCard,
        Paypal,
        VNPay,
        Momo
    }

    public class PaymentEnity
    {
        [Key]
        public Guid BookingId { get; set; }
        public PaymentMethod Method { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }
        public PaymentStatus Status { get; set; }
        public DateTime TransactionDate { get; set; }
    }
}