using Confluent.Kafka;
using SearchService.Dtos;
using SearchService.Models;
using SearchService.Services;
using System.Text.Json;

namespace SearchService.Kafka.Consumers
{
    public class TourEventsConsumer : BackgroundService
    {
        private readonly IConsumer<string, string> _consumer;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<TourEventsConsumer> _logger;
        private readonly IConfiguration _configuration;
        private const string Domain = "vietnature";
        private const string Service = "tour-service";

        public TourEventsConsumer(IServiceScopeFactory scopeFactory, ILogger<TourEventsConsumer> logger, IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;

            var config = new ConsumerConfig
            {
                BootstrapServers = configuration["Kafka:BootstrapServers"],
                GroupId = configuration["Kafka:GroupId"] ?? "search-service-group",
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false,
                AllowAutoCreateTopics = true
            };

            _consumer = new ConsumerBuilder<string, string>(config).Build();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var env = _configuration["Environment"]?.ToLower() ?? "dev";
            var createdTopic = $"{env}.{Domain}.{Service}.tour.created";
            var updatedTopic = $"{env}.{Domain}.{Service}.tour.updated";
            var deletedTopic = $"{env}.{Domain}.{Service}.tour.deleted";

            _consumer.Subscribe(new[] { createdTopic, updatedTopic, deletedTopic });

            _logger.LogInformation("TourEventsConsumer started. Subscribed to: {Topics}", string.Join(", ", createdTopic, updatedTopic, deletedTopic));

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult = _consumer.Consume(stoppingToken);
                        if (consumeResult == null) continue;

                        _logger.LogInformation("Received message from {Topic}: {Key}", consumeResult.Topic, consumeResult.Message.Key);

                        using (var scope = _scopeFactory.CreateScope())
                        {
                            var tourSearchService = scope.ServiceProvider.GetRequiredService<ITourSearchService>();
                            await ProcessMessageAsync(consumeResult, tourSearchService);
                        }

                        _consumer.Commit(consumeResult);
                    }
                    catch (ConsumeException e)
                    {
                        _logger.LogError(e, "Error consuming Kafka message: {Reason}", e.Error.Reason);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Unexpected error processing message");
                    }
                }
            }
            finally
            {
                _consumer.Close();
                _consumer.Dispose();
            }
        }

        private async Task ProcessMessageAsync(ConsumeResult<string, string> result, ITourSearchService tourSearchService)
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var topic = result.Topic;

            if (topic.EndsWith("tour.created"))
            {
                var eventData = JsonSerializer.Deserialize<TourCreatedEvent>(result.Message.Value, options);
                if (eventData != null)
                {
                    var doc = new TourDocument
                    {
                        Id = eventData.TourId,
                        Name = eventData.Name,
                        Description = eventData.Description,
                        Region = eventData.Region,
                        Price = eventData.Price,
                        Duration = eventData.Duration,
                        ImageUrl = eventData.ImageUrl,
                        AvailableSlots = eventData.AvailableSlots,
                        Destinations = eventData.Destinations,
                        Tags = eventData.Tags
                    };
                    await tourSearchService.IndexTourAsync(doc);
                    _logger.LogInformation("Indexed tour: {Id}", doc.Id);
                }
            }
            else if (topic.EndsWith("tour.updated"))
            {
                var eventData = JsonSerializer.Deserialize<TourUpdatedEvent>(result.Message.Value, options);
                if (eventData != null)
                {
                    var doc = new TourDocument
                    {
                        Id = eventData.TourId,
                        Name = eventData.Name,
                        Description = eventData.Description,
                        Region = eventData.Region,
                        Price = eventData.Price,
                        Duration = eventData.Duration,
                        ImageUrl = eventData.ImageUrl,
                        AvailableSlots = eventData.AvailableSlots,
                        Destinations = eventData.Destinations,
                        Tags = eventData.Tags
                    };
                    await tourSearchService.IndexTourAsync(doc); // Index overwrites existing ID
                    _logger.LogInformation("Updated tour index: {Id}", doc.Id);
                }
            }
            else if (topic.EndsWith("tour.deleted"))
            {
                var eventData = JsonSerializer.Deserialize<TourDeletedEvent>(result.Message.Value, options);
                if (eventData != null)
                {
                    await tourSearchService.DeleteTourAsync(eventData.TourId);
                    _logger.LogInformation("Deleted tour index: {Id}", eventData.TourId);
                }
            }
        }
    }
}
