using Confluent.Kafka;
using System.Text.Json;
using TourService.Events;
using TourService.Services;

namespace TourService.Kafka.Consumers
{
    public class BookingRequestedConsumer : BackgroundService
    {
        private readonly ILogger<BookingRequestedConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly string _topic = "dev.vietnature.booking-service.booking.requested";
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };


        public BookingRequestedConsumer(
            IServiceScopeFactory scopeFactory,
            ILogger<BookingRequestedConsumer> logger,
            IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
             _logger.LogInformation("🎧 (BookingRequestedConsumer) Subscribed to topic: {Topic}", _topic);
            
            var config = new ConsumerConfig
            {
                BootstrapServers = _configuration["Kafka:BootstrapServers"],
                GroupId = "tour-service-booking-group",
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false
            };
            
            await Task.Delay(5000, stoppingToken); 

            using var consumer = new ConsumerBuilder<Ignore, string>(config).Build();
            consumer.Subscribe(_topic);

            while (!stoppingToken.IsCancellationRequested)
            {
                ConsumeResult<Ignore, string>? consumeResult = null;
                try
                {
                    consumeResult = consumer.Consume(stoppingToken); 
                    var message = consumeResult.Message.Value;
                    _logger.LogInformation("📩 (BookingRequestedConsumer) Received message from topic {Topic}", consumeResult.Topic);

                    var eventData = JsonSerializer.Deserialize<BookingRequestedEvent>(message, _jsonOptions);
                    
                    if (eventData != null)
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var tourService = scope.ServiceProvider.GetRequiredService<ITourService>();
                        await tourService.HandleBookingRequestAsync(eventData);
                    }
                    
                    consumer.Commit(consumeResult);
                }
                catch (ConsumeException e)
                {
                    if (e.Error.Code == ErrorCode.UnknownTopicOrPart)
                    {
                        _logger.LogWarning("⚠️ (BookingRequestedConsumer) Topic {Topic} chưa sẵn sàng. Đang chờ 5s...", _topic);
                        await Task.Delay(5000, stoppingToken);
                    }
                    else
                    {
                        _logger.LogError(e, "Kafka ConsumeException in BookingRequestedConsumer. Retrying in 5s...");
                        await Task.Delay(5000, stoppingToken);
                    }
                }
                catch (JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "❌ (BookingRequestedConsumer) Lỗi deserialize message. Bỏ qua. Message: {Message}", consumeResult?.Message.Value);
                    if (consumeResult != null)
                        consumer.Commit(consumeResult);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ (BookingRequestedConsumer) Error processing message. Retrying in 5s...");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }
    }
}