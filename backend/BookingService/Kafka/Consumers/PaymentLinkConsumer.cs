using BookingService.Events;
using BookingService.Repositories;
using BookingService.Enums;
using Confluent.Kafka; // <-- Thêm Using
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using System.Threading.Tasks;
using System;
using PaymentService.Events;

namespace BookingService.Kafka.Consumers
{
    public class PaymentLinkConsumer : BackgroundService
    {
        private readonly ConsumerConfig _consumerConfig;
        private readonly ILogger<PaymentLinkConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

        public PaymentLinkConsumer(
            ConsumerConfig consumerConfig,
            ILogger<PaymentLinkConsumer> logger,
            IServiceScopeFactory scopeFactory)
        {
            _consumerConfig = consumerConfig;
            _logger = logger;
            _scopeFactory = scopeFactory;
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🎧 Payment Link Consumer (lắng nghe 'payment.initiated') đang khởi chạy...");

            var consumerConfig = new ConsumerConfig(_consumerConfig)
            {
                GroupId = "booking-service-payment-link-group",
                EnableAutoCommit = false
            };
            
            await Task.Delay(5000, stoppingToken);

            using var consumer = new ConsumerBuilder<Ignore, string>(consumerConfig).Build();
            consumer.Subscribe("payment.initiated");

            while (!stoppingToken.IsCancellationRequested)
            {
                ConsumeResult<Ignore, string>? consumeResult = null;
                try
                {
                    consumeResult = consumer.Consume(stoppingToken);
                    var message = consumeResult.Message.Value;
                    _logger.LogInformation("📩 (PaymentLinkConsumer) Nhận được sự kiện từ 'payment.initiated': {Message}", message);

                    var paymentEvent = JsonSerializer.Deserialize<InitiatePaymentEvent>(message, _jsonOptions);

                    if (paymentEvent != null && !string.IsNullOrEmpty(paymentEvent.PaymentLink))
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var repository = scope.ServiceProvider.GetRequiredService<IBookingRepository>();
                        
                        var booking = await repository.GetByIdAsync(paymentEvent.BookingId);
                        
                        if (booking != null && booking.Status == BookingStatus.Pending)
                        {
                            booking.PaymentLink = paymentEvent.PaymentLink;
                            booking.UpdatedAt = DateTime.UtcNow;
                            await repository.UpdateAsync(booking);
                            _logger.LogInformation("✅ Đã cập nhật PaymentLink cho BookingId: {BookingId}", paymentEvent.BookingId);
                        }
                        else
                        {
                            _logger.LogWarning("⚠️ (PaymentLinkConsumer) Không tìm thấy BookingId: {BookingId} hoặc trạng thái không phải Pending (status: {Status}). Bỏ qua cập nhật link.", 
                                paymentEvent.BookingId, booking?.Status);
                        }
                        consumer.Commit(consumeResult);
                    }
                    else
                    {
                        _logger.LogWarning("❌ (PaymentLinkConsumer) Deserialize InitiatePaymentEvent bị lỗi hoặc PaymentLink rỗng. Bỏ qua message.");
                        consumer.Commit(consumeResult);
                    }
                }
                // --- THÊM KHỐI CATCH NÀY ---
                catch (ConsumeException e)
                {
                    if (e.Error.Code == ErrorCode.UnknownTopicOrPart)
                    {
                        _logger.LogWarning("⚠️ (PaymentLinkConsumer) Topic 'payment.initiated' chưa sẵn sàng. Đang chờ 5s...");
                        await Task.Delay(5000, stoppingToken);
                    }
                    else
                    {
                        _logger.LogError(e, "Kafka ConsumeException in PaymentLinkConsumer. Retrying in 5s...");
                        await Task.Delay(5000, stoppingToken);
                    }
                }
                // --- HẾT KHỐI CATCH ---
                catch (JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "❌ (PaymentLinkConsumer) Lỗi deserialize message. Bỏ qua. Message: {Message}", consumeResult?.Message.Value);
                    if (consumeResult != null)
                        consumer.Commit(consumeResult);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ (PaymentLinkConsumer) Lỗi khi xử lý 'payment.initiated'. Message sẽ được thử lại.");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }
    }
}