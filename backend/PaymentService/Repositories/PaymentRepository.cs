using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Entities;

namespace PaymentService.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly PaymentDbContext _context;
        private readonly ILogger<PaymentRepository> _logger;

        public PaymentRepository(PaymentDbContext context, ILogger<PaymentRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task AddAsync(PaymentEntity payment)
        {
            try
            {
                await _context.Payments.AddAsync(payment);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Đã thêm PaymentEntity mới với ID: {PaymentId} cho BookingId: {BookingId}", payment.Id, payment.BookingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thêm PaymentEntity cho BookingId: {BookingId}", payment.BookingId);
                throw;
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(id);
                if (payment != null)
                {
                    _context.Payments.Remove(payment);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Đã xóa PaymentEntity với ID: {PaymentId}", id);
                }
                else
                {
                     _logger.LogWarning("Không tìm thấy PaymentEntity với ID: {PaymentId} để xóa.", id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa PaymentEntity với ID: {PaymentId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<PaymentEntity>> GetByBookingIdAsync(Guid bookingId)
        {
            return await _context.Payments
                .Where(p => p.BookingId == bookingId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<PaymentEntity?> GetByGatewayTransactionIdAsync(string transactionId)
        {
            return await _context.Payments
                .FirstOrDefaultAsync(p => p.PaymentGatewayTransactionId == transactionId);
        }

        public async Task<PaymentEntity?> GetByIdAsync(Guid id)
        {
            return await _context.Payments.FindAsync(id);
        }

        public async Task<PaymentEntity?> GetByPaymentIntentIdAsync(string paymentIntentId)
        {
            return await _context.Payments
                .FirstOrDefaultAsync(p => p.PaymentIntentId == paymentIntentId);
        }

        public async Task UpdateAsync(PaymentEntity payment)
        {
            try
            {
                _context.Entry(payment).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                 _logger.LogInformation("Đã cập nhật PaymentEntity với ID: {PaymentId}", payment.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật PaymentEntity với ID: {PaymentId}", payment.Id);
                throw;
            }
        }
    }
}