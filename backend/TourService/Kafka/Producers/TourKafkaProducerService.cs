using Confluent.Kafka;
using System.Text.Json;
using TourService.Events;

namespace TourService.Kafka.Producers
{
    public class TourKafkaProducerService : ITourKafkaProducerService
    {
        private readonly IProducer<string, string> _producer;
        private readonly ILogger<TourKafkaProducerService> _logger;
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        public TourKafkaProducerService(IProducer<string, string> producer, ILogger<TourKafkaProducerService> logger)
        {
            _producer = producer;
            _logger = logger;
        }

        public async Task ProduceSlotsReservedAsync(SlotsReservedEvent eventData, CancellationToken cancellationToken = default)
        {
            await ProduceMessageAsync("slots.reserved", eventData.BookingId.ToString(), eventData, cancellationToken);
        }

        public async Task ProduceSlotsFailedAsync(SlotsFailedEvent eventData, CancellationToken cancellationToken = default)
        {
            await ProduceMessageAsync("slots.failed", eventData.BookingId.ToString(), eventData, cancellationToken);
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
    }
}