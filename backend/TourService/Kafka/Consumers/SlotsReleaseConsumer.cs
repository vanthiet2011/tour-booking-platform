using Confluent.Kafka;
using System.Text.Json;
using TourService.Events;
using TourService.Services;

namespace TourService.Kafka.Consumers
{
    public class SlotsReleaseConsumer : BackgroundService
    {
        private readonly ILogger<SlotsReleaseConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly string _topic = "dev.vietnature.booking-service.slots.release-requested";
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

        public SlotsReleaseConsumer(
            IServiceScopeFactory scopeFactory,
            ILogger<SlotsReleaseConsumer> logger,
            IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
             _logger.LogInformation("🎧 (SlotsReleaseConsumer) Subscribed to topic: {Topic}", _topic);

            var config = new ConsumerConfig
            {
                BootstrapServers = _configuration["Kafka:BootstrapServers"],
                GroupId = "tour-service-release-group",
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
                    _logger.LogInformation("📩 (SlotsReleaseConsumer) Received message from topic {Topic}", consumeResult.Topic);

                    var eventData = JsonSerializer.Deserialize<ReleaseSlotsEvent>(message, _jsonOptions);
                    
                    if (eventData != null)
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var tourService = scope.ServiceProvider.GetRequiredService<ITourService>();
                        await tourService.HandleReleaseSlotsAsync(eventData);
                    }
                    
                    consumer.Commit(consumeResult);
                }
                catch (ConsumeException e)
                {
                    if (e.Error.Code == ErrorCode.UnknownTopicOrPart)
                    {
                        _logger.LogWarning("⚠️ (SlotsReleaseConsumer) Topic {Topic} chưa sẵn sàng. Đang chờ 5s...", _topic);
                        await Task.Delay(5000, stoppingToken);
                    }
                    else
                    {
                        _logger.LogError(e, "Kafka ConsumeException in SlotsReleaseConsumer. Retrying in 5s...");
                        await Task.Delay(5000, stoppingToken);
                    }
                }
                catch (JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "❌ (SlotsReleaseConsumer) Lỗi deserialize message. Bỏ qua. Message: {Message}", consumeResult?.Message.Value);
                    if (consumeResult != null)
                        consumer.Commit(consumeResult);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ (SlotsReleaseConsumer) Error processing message. Retrying in 5s...");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }
    }
}