using PaymentService.Entities;

namespace PaymentService.Repositories
{
    public interface IPaymentRepository
    {
        Task<PaymentEntity?> GetByIdAsync(Guid id);
        Task<IEnumerable<PaymentEntity>> GetByBookingIdAsync(Guid bookingId);
        Task<PaymentEntity?> GetByPaymentIntentIdAsync(string paymentIntentId);
        Task<PaymentEntity?> GetByGatewayTransactionIdAsync(string transactionId);
        Task AddAsync(PaymentEntity payment);
        Task UpdateAsync(PaymentEntity payment);
        Task DeleteAsync(Guid id);
    }
}