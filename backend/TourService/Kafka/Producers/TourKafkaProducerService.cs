using Confluent.Kafka;
using System.Text.Json;
using TourService.Events;

namespace TourService.Kafka.Producers
{
    public class TourKafkaProducerService : ITourKafkaProducerService
    {
        private readonly IProducer<string, string> _producer;
        private readonly ILogger<TourKafkaProducerService> _logger;
        IConfiguration _configuration;
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        private const string Domain = "vietnature";
        private const string Service = "tour-service";
        public TourKafkaProducerService(IProducer<string, string> producer, ILogger<TourKafkaProducerService> logger, IConfiguration configuration)
        {
            _producer = producer;
            _logger = logger;
            _configuration = configuration;
        }
        public async Task ProduceTourCreatedAsync(TourCreatedEvent eventData, CancellationToken cancellationToken = default)
        {
            string topic = GetTopicName("tour", "created"); 
            await ProduceMessageAsync(topic, eventData.TourId.ToString(), eventData, cancellationToken);
        }

        public async Task ProduceSlotsReservedAsync(SlotsReservedEvent eventData, CancellationToken cancellationToken = default)
        {
            string topic = GetTopicName("booking", "slotsreserved");
            await ProduceMessageAsync(topic, eventData.BookingId.ToString(), eventData, cancellationToken);
        }

        public async Task ProduceSlotsFailedAsync(SlotsFailedEvent eventData, CancellationToken cancellationToken = default)
        {
            string topic = GetTopicName("booking", "slotsfailed");
            await ProduceMessageAsync(topic, eventData.BookingId.ToString(), eventData, cancellationToken);
        }

        // Phương thức chung để gửi message
        private async Task ProduceMessageAsync<T>(string topic, string key, T value, CancellationToken cancellationToken) where T : class
        {
            var message = new Message<string, string>
            {
                Key = key,
                Value = JsonSerializer.Serialize(value, _jsonOptions)
            };

            try
            {
                var result = await _producer.ProduceAsync(topic, message, cancellationToken);
                _logger.LogInformation("Đã gửi sự kiện '{EventType}' đến topic '{TopicPartitionOffset}'. Key: {Key}",
                    typeof(T).Name, result.TopicPartitionOffset, key);
            }
            catch (ProduceException<string, string> e)
            {
                _logger.LogError(e, "Lỗi khi gửi sự kiện '{EventType}' đến topic '{Topic}'. Key: {Key}. Lý do: {Reason}",
                    typeof(T).Name, topic, key, e.Error.Reason);
                throw;
            }
        }

        public async Task ProduceTourUpdatedAsync(TourUpdatedEvent eventData, CancellationToken cancellationToken = default)
        {
            string topic = GetTopicName("tour", "updated");
            await ProduceMessageAsync(topic, eventData.TourId.ToString(), eventData, cancellationToken);
        }

        public async Task ProduceTourDeletedAsync(TourDeletedEvent eventData, CancellationToken cancellationToken = default)
        {
            string topic = GetTopicName("tour", "deleted");
            await ProduceMessageAsync(topic, eventData.TourId.ToString(), eventData, cancellationToken);
        }

        private string GetTopicName(string resource, string @event)
        {
            var env = _configuration["Environment"]?.ToLower() ?? "dev";
            return $"{env}.{Domain}.{Service}.{resource}.{@event}";
        }
    }
}