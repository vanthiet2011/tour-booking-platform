using PaymentService.Data;
using PaymentService.Dtos;
using PaymentService.Entities;
using PaymentService.Enums;
using PaymentService.Events;
using PaymentService.Kafka.Producers;
using PaymentService.Repositories; // Cần tạo Repository

namespace PaymentService.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IPaymentKafkaProducerService _producerService;
    private readonly ILogger<PaymentService> _logger;
    private readonly IConfiguration _configuration;

    public PaymentService(IPaymentRepository paymentRepository, ILogger<PaymentService> logger, IConfiguration configuration, IPaymentKafkaProducerService producerService)
    {
        _paymentRepository = paymentRepository;
        _producerService = producerService;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<PaymentEntity> CreatePaymentSessionAsync(SlotsReservedEvent eventData)
    {
        _logger.LogInformation("Bắt đầu tạo phiên thanh toán cho BookingId: {BookingId}, Số tiền: {Amount}", eventData.BookingId, eventData.TotalPrice);
        var returnUrlBase = _configuration["PaymentGateway:ReturnUrlBase"];
        var successUrl = $"{returnUrlBase}?bookingId={eventData.BookingId}&status=success";
        var cancelUrl = $"{returnUrlBase}?bookingId={eventData.BookingId}&status=cancel";
        var paymentIntentId = $"pi_{Guid.NewGuid():N}";
        var paymentLink = $"http://localhost:5005/mock-payment-page?intentId={paymentIntentId}&amount={eventData.TotalPrice}&successUrl={Uri.EscapeDataString(successUrl)}&cancelUrl={Uri.EscapeDataString(cancelUrl)}";
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        _logger.LogInformation("Đã tạo link thanh toán (giả lập) cho BookingId: {BookingId}", eventData.BookingId);

        var paymentEntity = new PaymentEntity
        {
            BookingId = eventData.BookingId,
            Amount = eventData.TotalPrice,
            Status = PaymentStatus.Pending,
            PaymentGatewayName = "MockGateway",
            PaymentIntentId = paymentIntentId,
            PaymentLink = paymentLink,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt
        };
        try
        {
            await _paymentRepository.AddAsync(paymentEntity);
            _logger.LogInformation("Đã lưu PaymentEntity vào DB với ID: {PaymentId}", paymentEntity.Id);
            return paymentEntity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lưu PaymentEntity cho BookingId: {BookingId}", eventData.BookingId);
            throw;
        }
    }
    
    public async Task HandleWebhookPayloadAsync(WebhookPayloadDto payload)
        {
            _logger.LogInformation("Đang xử lý Webhook cho PaymentIntentId: {PaymentIntentId}, EventType: {EventType}",
                payload.PaymentIntentId, payload.EventType);
            var payment = await _paymentRepository.GetByPaymentIntentIdAsync(payload.PaymentIntentId);

            if (payment == null)
            {
                _logger.LogError("Không tìm thấy PaymentEntity với PaymentIntentId: {PaymentIntentId}. Webhook bị bỏ qua.", payload.PaymentIntentId);
                return;
            }

            if (payment.Status == PaymentStatus.Succeeded || payment.Status == PaymentStatus.Failed)
            {
                _logger.LogWarning("PaymentIntentId: {PaymentIntentId} đã được xử lý (Status: {Status}). Webhook bị bỏ qua.",
                    payload.PaymentIntentId, payment.Status);
                return;
            }

            if (payload.EventType == "payment.succeeded")
            {
                payment.Status = PaymentStatus.Succeeded;
                payment.PaymentGatewayTransactionId = payload.TransactionId;
                payment.UpdatedAt = DateTime.UtcNow;
                await _paymentRepository.UpdateAsync(payment);
                _logger.LogInformation("✅ PaymentEntity {PaymentId} đã cập nhật sang Succeeded.", payment.Id);

                var successEvent = new PaymentSucceededEvent
                {
                    BookingId = payment.BookingId,
                    PaymentId = payment.Id,
                    TransactionId = payment.PaymentGatewayTransactionId ?? ""
                };
                await _producerService.ProducePaymentSucceededAsync(successEvent);
            }
            else if (payload.EventType == "payment.failed")
            {
                payment.Status = PaymentStatus.Failed;
                payment.ErrorCode = "GATEWAY_FAILURE";
                payment.ErrorMessage = payload.ErrorReason;
                payment.UpdatedAt = DateTime.UtcNow;
                await _paymentRepository.UpdateAsync(payment);
                _logger.LogWarning("❌ PaymentEntity {PaymentId} đã cập nhật sang Failed. Lý do: {Reason}", payment.Id, payload.ErrorReason);
                
                var failedEvent = new PaymentFailedEvent
                {
                    BookingId = payment.BookingId,
                    PaymentId = payment.Id,
                    Reason = payload.ErrorReason ?? "Giao dịch thất bại"
                };
                await _producerService.ProducePaymentFailedAsync(failedEvent);
            }
            else
            {
                _logger.LogWarning("Không nhận dạng được Webhook EventType: {EventType}. Bỏ qua.", payload.EventType);
            }
        }
}