using Confluent.Kafka;
using BookingService.Events;
using BookingService.Repositories;
using BookingService.Enums;
using System.Text.Json;

namespace BookingService.Kafka.Consumers
{
    public class SlotsResponseConsumer : BackgroundService
    {
        private readonly ILogger<SlotsResponseConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        // Chỉ lắng nghe topic 'slots.failed'
        private readonly string _topic = "slots.failed";

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
            var repository = scope.ServiceProvider.GetRequiredService<IBookingRepository>();
            
            var booking = await repository.GetByIdAsync(eventData.BookingId);

            if (booking != null && booking.Status == BookingStatus.Pending)
            {
                booking.Status = BookingStatus.Failed;
                booking.FailureReason = eventData.Reason; 
                booking.UpdatedAt = DateTime.UtcNow;
                
                await repository.UpdateAsync(booking);
                
                _logger.LogWarning("❌ Booking {BookingId} status updated to Failed. Reason: {Reason}", 
                    booking.Id, eventData.Reason);
            }
            else
            {
                _logger.LogWarning("Booking {BookingId} not found or status was not Pending (status: {Status}). 'slots.failed' message ignored.", 
                    eventData.BookingId, booking?.Status);
            }
        }
    }
}