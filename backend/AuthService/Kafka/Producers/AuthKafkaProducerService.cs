using Confluent.Kafka;
using System.Text.Json;
using AuthService.Events;
using AuthService.Services.Interfaces;

namespace AuthService.Kafka.Producers
{
    public class AuthKafkaProducerService : IAuthKafkaProducerService
    {
        private readonly IProducer<string, string> _producer;
        private readonly ILogger<AuthKafkaProducerService> _logger;
        IConfiguration _configuration;
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        private const string Domain = "vietnature";
        private const string Service = "auth-service";
        public AuthKafkaProducerService(IProducer<string, string> producer, ILogger<AuthKafkaProducerService> logger, IConfiguration configuration)
        {
            _producer = producer;
            _logger = logger;
            _configuration = configuration;
        }
        public async Task ProduceUserCreatedAsync(UserCreatedEvent eventData, CancellationToken cancellationToken = default)
        {
            string topic = GetTopicName("user", "created"); 
            await ProduceMessageAsync(topic, eventData.UserId.ToString(), eventData, cancellationToken);
        }

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

        private string GetTopicName(string resource, string @event)
        {
            var env = _configuration["Environment"]?.ToLower() ?? "dev";
            return $"{env}.{Domain}.{Service}.{resource}.{@event}";
        }
    }
}