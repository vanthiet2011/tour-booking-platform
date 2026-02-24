using BookingService.Events;
using Confluent.Kafka;
using System.Text.Json;

namespace BookingService.Kafka.Producers;

public class BookingKafkaProducerService : IBookingKafkaProducerService
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<BookingKafkaProducerService> _logger;
    private readonly IConfiguration _configuration;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    private const string Domain = "vietnature";
    private const string Service = "booking-service";
    public BookingKafkaProducerService(IProducer<string, string> producer, ILogger<BookingKafkaProducerService> logger, IConfiguration configuration)
    {
        _producer = producer;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task ProduceBookingRequestedAsync(BookingRequestedEvent eventData, CancellationToken cancellationToken = default)
    {
        string topic = GetTopicName("booking", "requested"); 
        await ProduceMessageAsync(topic, eventData.BookingId.ToString(), eventData, cancellationToken);
    }

    public async Task ProduceReleaseSlotsRequestedAsync(ReleaseSlotsEvent eventData, CancellationToken cancellationToken = default)
    {
        string topic = GetTopicName("slots", "release-requested");
        await ProduceMessageAsync(topic, eventData.BookingId.ToString(), eventData, cancellationToken);
    }

    public async Task ProduceBookingConfirmedAsync(BookingConfirmedEvent eventData, CancellationToken cancellationToken = default)
    {
        string topic = GetTopicName("booking", "confirmed"); 
        await ProduceMessageAsync(topic, eventData.BookingId.ToString(), eventData, cancellationToken);
    }

    public async Task ProduceBookingCompletedAsync(BookingCompletedEvent eventData, CancellationToken cancellationToken = default)
    {
        string topic = GetTopicName("booking", "completed"); 
        await ProduceMessageAsync(topic, eventData.BookingId.ToString(), eventData, cancellationToken);
    }

    public async Task ProduceBookingCancelledAsync(BookingCancelledEvent eventData, CancellationToken cancellationToken = default)
    {
        string topic = GetTopicName("booking", "cancelled"); 
        await ProduceMessageAsync(topic, eventData.BookingId.ToString(), eventData, cancellationToken);
    }

    public async Task ProduceBookingFailedAsync(BookingFailedEvent eventData, CancellationToken cancellationToken = default)
    {
        string topic = GetTopicName("booking", "failed"); 
        await ProduceMessageAsync(topic, eventData.BookingId.ToString(), eventData, cancellationToken);
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