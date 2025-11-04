using BookingService.Events;
using Confluent.Kafka;
using System.Text.Json;

namespace BookingService.Kafka.Producers; // <-- THAY ĐỔI TỪ .Services

public class KafkaProducerService : IKafkaProducerService
{
    // [Toàn bộ nội dung của class giữ nguyên]
    // ... (Constructor, ProduceBookingRequestedAsync, ProduceReleaseSlotsRequestedAsync, ProduceMessageAsync)
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaProducerService> _logger;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public KafkaProducerService(IProducer<string, string> producer, ILogger<KafkaProducerService> logger)
    {
        _producer = producer;
        _logger = logger;
    }

    public async Task ProduceBookingRequestedAsync(BookingRequestedEvent eventData, CancellationToken cancellationToken = default)
    {
        await ProduceMessageAsync("booking.requested", eventData.BookingId.ToString(), eventData, cancellationToken);
    }

    public async Task ProduceReleaseSlotsRequestedAsync(ReleaseSlotsEvent eventData, CancellationToken cancellationToken = default)
    {
        await ProduceMessageAsync("slots.release.requested", eventData.BookingId.ToString(), eventData, cancellationToken);
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