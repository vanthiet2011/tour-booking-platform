using PaymentService.Enums;
using PaymentService.Events;
using PaymentService.Kafka.Producers;
using PaymentService.Repositories;

namespace PaymentService.Services;

public class PaymentJobService : IPaymentJobService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IPaymentKafkaProducerService _kafkaProducerService;
    private readonly ILogger<PaymentJobService> _logger;

    public PaymentJobService(
        IPaymentRepository paymentRepository,
        IPaymentKafkaProducerService kafkaProducerService,
        ILogger<PaymentJobService> logger)
    {
        _paymentRepository = paymentRepository;
        _kafkaProducerService = kafkaProducerService;
        _logger = logger;
    }

    public async Task CheckAndExpirePayment(Guid paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null)
        {
            _logger.LogWarning("Job: Không tìm thấy Payment {PaymentId}", paymentId);
            return;
        }

        if (payment.Status != PaymentStatus.Pending && payment.Status != PaymentStatus.AwaitingOffice)
        {
            // Payment đã xử lý xong hoặc đã failed
            return;
        }

        if (payment.ExpiresAt == null)
        {
            // Không có hạn => Không hết hạn? Hoặc default strategy?
            return;
        }

        if (DateTime.UtcNow < payment.ExpiresAt.Value)
        {
            // Chưa hết hạn
            return;
        }

        _logger.LogInformation("Job: Payment {PaymentId} đã hết hạn (ExpiresAt: {ExpiresAt}). Đang chuyển sang Expired...", paymentId, payment.ExpiresAt);

        payment.Status = PaymentStatus.Expired;
        payment.ErrorMessage = PaymentFailureReason.PaymentExpired.ToString();
        payment.UpdatedAt = DateTime.UtcNow;

        await _paymentRepository.UpdateAsync(payment);

        await _kafkaProducerService.ProducePaymentFailedAsync(new PaymentFailedEvent
        {
            BookingId = payment.BookingId,
            PaymentId = payment.Id,
            Reason = PaymentFailureReason.PaymentExpired.ToString()
        });

        _logger.LogInformation("Job: Đã chuyển Payment {PaymentId} sang Expired và gửi event PaymentFailed.", paymentId);
    }
}
