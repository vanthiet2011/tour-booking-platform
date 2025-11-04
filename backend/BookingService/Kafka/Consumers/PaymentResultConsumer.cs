using Confluent.Kafka; // <-- Thêm Using
using BookingService.Events;
using BookingService.Repositories;
using BookingService.Enums;
using System.Text.Json;
using BookingService.Kafka.Producers;
using BookingService.Services;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Configuration; // Cần Configuration

namespace BookingService.Kafka.Consumers
{
    public class PaymentResultConsumer : BackgroundService
    {
        private readonly ILogger<PaymentResultConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly string[] _topics = { "payment.succeeded", "payment.failed" };
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

        public PaymentResultConsumer(
            IServiceScopeFactory scopeFactory,
            ILogger<PaymentResultConsumer> logger,
            IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🎧 (PaymentResultConsumer) Subscribed to topics: {Topics}", string.Join(", ", _topics));
            
            var config = new ConsumerConfig
            {
                BootstrapServers = _configuration["Kafka:BootstrapServers"],
                GroupId = "booking-payment-result-group", // Group ID riêng
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false
            };

            await Task.Delay(5000, stoppingToken);

            using var consumer = new ConsumerBuilder<Ignore, string>(config).Build();
            consumer.Subscribe(_topics);

            while (!stoppingToken.IsCancellationRequested)
            {
                ConsumeResult<Ignore, string>? consumeResult = null;
                try
                {
                    consumeResult = consumer.Consume(stoppingToken); 
                    var message = consumeResult.Message.Value;
                    var topic = consumeResult.Topic;
                    _logger.LogInformation("📩 (PaymentResultConsumer) Received message from topic {Topic}", topic);

                    if (topic == "payment.succeeded")
                    {
                        var eventData = JsonSerializer.Deserialize<PaymentSucceededEvent>(message, _jsonOptions);
                        if (eventData != null)
                            await ProcessPaymentSucceeded(eventData);
                    }
                    else if (topic == "payment.failed")
                    {
                        var eventData = JsonSerializer.Deserialize<PaymentFailedEvent>(message, _jsonOptions);
                        if (eventData != null)
                            await ProcessPaymentFailed(eventData);
                    }
                    consumer.Commit(consumeResult);
                }
                catch (ConsumeException e)
                {
                    if (e.Error.Code == ErrorCode.UnknownTopicOrPart)
                    {
                        _logger.LogWarning("⚠️ (PaymentResultConsumer) Topics {Topics} chưa sẵn sàng. Đang chờ 5s...", string.Join(", ", _topics));
                        await Task.Delay(5000, stoppingToken);
                    }
                    else
                    {
                        _logger.LogError(e, "Kafka ConsumeException in PaymentResultConsumer. Retrying in 5s...");
                        await Task.Delay(5000, stoppingToken);
                    }
                }
                // --- HẾT KHỐI CATCH ---
                catch (JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "❌ (PaymentResultConsumer) Lỗi deserialize message. Bỏ qua. Message: {Message}", consumeResult?.Message.Value);
                    if (consumeResult != null)
                        consumer.Commit(consumeResult);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ (PaymentResultConsumer) Lỗi xử lý message. Retrying in 5s... (sẽ xử lý lại message này)");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }
        
        private async Task ProcessPaymentSucceeded(PaymentSucceededEvent eventData)
        {
            using var scope = _scopeFactory.CreateScope();
            var repository = scope.ServiceProvider.GetRequiredService<IBookingRepository>();
            var booking = await repository.GetByIdAsync(eventData.BookingId);

            if (booking != null && booking.Status == BookingStatus.Pending)
            {
                booking.Status = BookingStatus.Confirmed;
                booking.UpdatedAt = DateTime.UtcNow;
                await repository.UpdateAsync(booking);
                _logger.LogInformation("✅ Booking {BookingId} status updated to Confirmed.", booking.Id);
            }
            else
            {
                _logger.LogWarning("Booking {BookingId} not found or status was not Pending (status: {Status}). 'payment.succeeded' message ignored.",
                    eventData.BookingId, booking?.Status);
            }
        }

        private async Task ProcessPaymentFailed(PaymentFailedEvent eventData)
        {
            using var scope = _scopeFactory.CreateScope();
            var bookingService = scope.ServiceProvider.GetRequiredService<IBookingService>();
            await bookingService.HandlePaymentFailureAsync(eventData);
        }
    }
}