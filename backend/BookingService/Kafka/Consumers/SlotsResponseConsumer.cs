using Confluent.Kafka;
using BookingService.Events;
using BookingService.Repositories;
using BookingService.Enums;
using System.Text.Json;
using BookingService.Services;

namespace BookingService.Kafka.Consumers
{
    public class SlotsResponseConsumer : BackgroundService
    {
        private readonly ILogger<SlotsResponseConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly string _topic = "dev.vietnature.tour-service.booking.slotsfailed";

        public SlotsResponseConsumer(
            IServiceScopeFactory scopeFactory,
            ILogger<SlotsResponseConsumer> logger,
            IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            return Task.Run(() => StartConsumerLoop(stoppingToken), stoppingToken);
        }

        private async Task StartConsumerLoop(CancellationToken stoppingToken)
        {
            var config = new ConsumerConfig
            {
                BootstrapServers = _configuration["Kafka:BootstrapServers"],
                GroupId = "booking-slot-failure-group",
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false
            };

            using var consumer = new ConsumerBuilder<Ignore, string>(config).Build();
            consumer.Subscribe(_topic);
            _logger.LogInformation("🎧 (SlotsResponseConsumer) Subscribed to topic: {Topic}", _topic);

            while (!stoppingToken.IsCancellationRequested)
            {
                ConsumeResult<Ignore, string>? consumeResult = null;
                try
                {
                    consumeResult = consumer.Consume(stoppingToken); 
                    var message = consumeResult.Message.Value;

                    _logger.LogInformation("📩 (SlotsResponseConsumer) Received message from topic {Topic}", consumeResult.Topic);

                    var eventData = JsonSerializer.Deserialize<SlotsFailedEvent>(message,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    if (eventData != null)
                        await ProcessSlotsFailed(eventData);
                    
                    consumer.Commit(consumeResult);
                }
                catch (ConsumeException e)
                {
                    if (e.Error.Code == ErrorCode.UnknownTopicOrPart)
                    {
                        _logger.LogWarning("⚠️ (SlotsResponseConsumer) Topic {Topic} chưa sẵn sàng. Đang chờ 5s...", _topic);
                        await Task.Delay(5000, stoppingToken);
                    }
                    else
                    {
                        _logger.LogError(e, "Kafka ConsumeException in SlotsResponseConsumer. Retrying in 5s...");
                        await Task.Delay(5000, stoppingToken);
                    }
                }
                catch (JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "❌ (SlotsResponseConsumer) Failed to deserialize message. Skipping.");
                    if (consumeResult != null)
                        consumer.Commit(consumeResult);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ (SlotsResponseConsumer) Error processing message. Retrying in 5s...");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }


        private async Task ProcessSlotsFailed(SlotsFailedEvent eventData)
        {
            using var scope = _scopeFactory.CreateScope();
            var bookingService = scope.ServiceProvider.GetRequiredService<IBookingService>();
    
            _logger.LogWarning("❌ Nhận tin nhắn thất bại slots cho Booking: {BookingId}. Đang thực hiện chuyển trạng thái Failed...", 
                eventData.BookingId);

            try 
            {
                await bookingService.UpdateBookingStatusAsync(
                    eventData.BookingId, 
                    BookingStatus.Failed, 
                    eventData.Reason);

                _logger.LogInformation("✅ Đã xử lý xong slots.failed cho Booking {BookingId}.", eventData.BookingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi gọi UpdateBookingStatusAsync cho đơn hàng {BookingId}", eventData.BookingId);
            }
        }
    }
}