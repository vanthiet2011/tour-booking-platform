using PaymentService.Data;
using PaymentService.Dtos;
using PaymentService.Entities;
using PaymentService.Enums;
using PaymentService.Events;
using PaymentService.Kafka.Producers;
using PaymentService.Repositories;
using PaymentService.Services.Providers;
using Hangfire; // Added for IBackgroundJobClient

namespace PaymentService.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly ILogger<PaymentService> _logger;
    private readonly IPaymentKafkaProducerService _kafkaProducerService;
    private readonly IEnumerable<IPaymentProvider> _paymentProviders;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public PaymentService(
        IPaymentRepository paymentRepository, 
        ILogger<PaymentService> logger,
        IPaymentKafkaProducerService kafkaProducerService,
        IEnumerable<IPaymentProvider> paymentProviders,
        IBackgroundJobClient backgroundJobClient)
    {
        _paymentRepository = paymentRepository;
        _logger = logger;
        _kafkaProducerService = kafkaProducerService;
        _paymentProviders = paymentProviders;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<PaymentEntity> ProcessPaymentDirectlyAsync(SlotsReservedEvent eventData)
    {
        // 1. Khởi tạo thực thể Payment với thông tin đầy đủ
        if (!Enum.TryParse<PaymentMethod>(eventData.PaymentMethod, true, out var method))
        {
            method = PaymentMethod.UnKnown;
        }
        
        var payment = new PaymentEntity
        {
            Id = Guid.NewGuid(),
            BookingId = eventData.BookingId,
            Amount = eventData.TotalPrice,
            PaymentMethod = method,
            Status = method == PaymentMethod.AtOffice ? PaymentStatus.AwaitingOffice : PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = method == PaymentMethod.AtOffice ? DateTime.UtcNow.AddHours(24) : DateTime.UtcNow.AddMinutes(15)
        };

        // 2. Lấy Provider tương ứng và tạo Link thanh toán ngay
        var provider = _paymentProviders.FirstOrDefault(p => p.Method == method);
        if (provider != null)
        {
             string ipAddress = !string.IsNullOrEmpty(eventData.IpAddress) ? eventData.IpAddress : "127.0.0.1";
             payment.PaymentLink = await provider.GeneratePaymentLinkAsync(payment, ipAddress);
        }
        else
        {
             _logger.LogWarning("Không tìm thấy Provider cho method {Method}. PaymentLink sẽ null.", method);
        }

        // 3. Lưu vào Database
        await _paymentRepository.AddAsync(payment);

        // 4. LẬP LỊCH DUY NHẤT 1 HANGFIRE JOB
        var delay = payment.ExpiresAt.Value - DateTime.UtcNow;
        if (delay < TimeSpan.Zero) delay = TimeSpan.Zero;
        
        _backgroundJobClient.Schedule<IPaymentJobService>(
            x => x.CheckAndExpirePayment(payment.Id),
            delay
        );

        _logger.LogInformation("✅ [Consolidated] Đã xử lý thanh toán {Method} cho Booking {BookingId}", method, payment.BookingId);
        
        return payment;
    }

    public async Task<PaymentStatusDto?> GetPaymentStatusByBookingIdAsync(Guid bookingId)
    {
        var payments = await _paymentRepository.GetByBookingIdAsync(bookingId);

        var payment = payments
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefault();

        if (payment == null)
            return null;

        return new PaymentStatusDto
        {
            BookingId = payment.BookingId,
            PaymentId = payment.Id,
            Status = payment.Status.ToString(),
            PaymentMethod = payment.PaymentMethod.ToString(),
            Amount = payment.Amount,
            PaymentLink = payment.PaymentLink,
            UpdatedAt = payment.UpdatedAt
        };
    }

    public async Task<PaymentStatusDto?> GetPaymentStatusByIdAsync(Guid paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);

        if (payment == null) return null;

        return new PaymentStatusDto
        {
            BookingId = payment.BookingId,
            PaymentId = payment.Id,
            Status = payment.Status.ToString(),
            PaymentMethod = payment.PaymentMethod.ToString(),
            Amount = payment.Amount,
            PaymentLink = payment.PaymentLink,
            UpdatedAt = payment.UpdatedAt
        };
    }

    public async Task<bool> CompletePaymentAsync(Guid paymentId, PaymentMethod method, object callbackData)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null) return false;

        var provider = _paymentProviders.FirstOrDefault(p => p.Method == method)
            ?? throw new NotSupportedException($"Payment method {method} not supported");

        // Idempotency Check
        if (payment.Status == PaymentStatus.Completed)
        {
            _logger.LogInformation("Payment {PaymentId} đã hoàn tất trước đó.", paymentId);
            return true;
        }
        if (payment.Status == PaymentStatus.Failed)
        {
            _logger.LogInformation("Payment {PaymentId} đã thất bại trước đó.", paymentId);
            return false;
        }

        if (payment.PaymentMethod != method)
        {
            payment.PaymentMethod = method;
        }

        var result = await provider.ProcessCallbackAsync(payment, callbackData);

        if (!result.IsSuccess)
        {
            payment.Status = PaymentStatus.Failed;
            payment.UpdatedAt = DateTime.UtcNow;

            await _paymentRepository.UpdateAsync(payment);

            // FIX: Publish PaymentFailedEvent so BookingService can handle logic (Cancel Booking & Release Slots)
            await _kafkaProducerService.ProducePaymentFailedAsync(
                new PaymentFailedEvent
                {
                    BookingId = payment.BookingId,
                    PaymentId = payment.Id,
                    Reason = result.ErrorMessage ?? PaymentFailureReason.PaymentFailed.ToString()
                });

            return false;
        }

        payment.Status = PaymentStatus.Completed;
        payment.PaymentGatewayTransactionId = result.TransactionId;
        payment.UpdatedAt = DateTime.UtcNow;

        await _paymentRepository.UpdateAsync(payment);

        await _kafkaProducerService.ProducePaymentSucceededAsync(
            new PaymentSucceededEvent
            {
                BookingId = payment.BookingId,
                PaymentId = payment.Id,
                PaymentMethod = payment.PaymentMethod.ToString()
            });

        return true;
    }
}