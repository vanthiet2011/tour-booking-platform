using Confluent.Kafka;
using PaymentService.Events;
using System.Text.Json;

namespace PaymentService.Kafka.Producers
{
    public class PaymentKafkaProducerService : IPaymentKafkaProducerService
    {
        private readonly IProducer<string, string> _producer;
        private readonly ILogger<PaymentKafkaProducerService> _logger;
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        // Inject IProducer gốc của Confluent Kafka
        public PaymentKafkaProducerService(IProducer<string, string> producer, ILogger<PaymentKafkaProducerService> logger)
        {
            _producer = producer;
            _logger = logger;
        }

        public async Task ProduceInitiatePaymentAsync(InitiatePaymentEvent eventData, CancellationToken cancellationToken = default)
        {
            await ProduceMessageAsync("payment.initiated", eventData.BookingId.ToString(), eventData, cancellationToken);
        }

        public async Task ProducePaymentSucceededAsync(PaymentSucceededEvent eventData, CancellationToken cancellationToken = default)
        {
            await ProduceMessageAsync("payment.succeeded", eventData.BookingId.ToString(), eventData, cancellationToken);
        }

        public async Task ProducePaymentFailedAsync(PaymentFailedEvent eventData, CancellationToken cancellationToken = default)
        {
            await ProduceMessageAsync("payment.failed", eventData.BookingId.ToString(), eventData, cancellationToken);
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
    }
}