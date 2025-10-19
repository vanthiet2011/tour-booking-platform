using Confluent.Kafka;
using System.Text.Json;

namespace AuthService.Services;

public class KafkaProducerService
{
    private readonly IProducer<string, string> _producer;
    private readonly string _topicName = "user-creation-topic";

    public KafkaProducerService(IConfiguration config)
    {
        var producerConfig = new ProducerConfig
        {
            BootstrapServers = config["Kafka:BootstrapServers"]
        };
        _producer = new ProducerBuilder<string, string>(producerConfig).Build();
    }

    public async Task ProduceAsync<T>(T message)
    {
        var serializedMessage = JsonSerializer.Serialize(message);
        await _producer.ProduceAsync(_topicName, new Message<string, string> { Value = serializedMessage });
    }
}