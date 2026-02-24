using Confluent.Kafka;
using PaymentService.Events;
using PaymentService.Kafka.Producers;
using PaymentService.Services;
using System.Text.Json;

namespace PaymentService.Kafka.Consumers 
{
    public class PaymentCreationConsumer : BackgroundService
    {
        private readonly ILogger<PaymentCreationConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly IPaymentKafkaProducerService _producerService;

        private const string Topic = "dev.vietnature.tour-service.booking.slotsreserved";
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

        public PaymentCreationConsumer(
            IServiceScopeFactory scopeFactory,
            ILogger<PaymentCreationConsumer> logger,
            IConfiguration configuration,
            IPaymentKafkaProducerService producerService)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
            _producerService = producerService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🎧 PaymentCreationConsumer subscribed to topic: {Topic}", Topic);

            var config = new ConsumerConfig
            {
                BootstrapServers = _configuration["Kafka:BootstrapServers"],
                GroupId = "payment-creation-group-fix-v1",
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false
            };

            await Task.Delay(5000, stoppingToken);

            using var consumer = new ConsumerBuilder<Ignore, string>(config).Build();
            consumer.Subscribe(Topic);

            while (!stoppingToken.IsCancellationRequested)
            {
                ConsumeResult<Ignore, string>? consumeResult = null;

                try
                {
                    consumeResult = consumer.Consume(stoppingToken);
                    var message = consumeResult.Message.Value;

                    var slotsEvent = JsonSerializer.Deserialize<SlotsReservedEvent>(message, _jsonOptions);

                    if (slotsEvent == null)
                    {
                        _logger.LogWarning("❌ SlotsReservedEvent deserialize failed. Skipping message.");
                        consumer.Commit(consumeResult);
                        continue;
                    }

                    using var scope = _scopeFactory.CreateScope();
                    var paymentService = scope.ServiceProvider.GetRequiredService<IPaymentService>();

                    var payment = await paymentService.ProcessPaymentDirectlyAsync(slotsEvent);

                    await _producerService.ProducePaymentCreatedAsync(new PaymentCreatedEvent {
                        BookingId = payment.BookingId,
                        PaymentId = payment.Id
                    });

                    consumer.Commit(consumeResult);

                    _logger.LogInformation(
                        "✅ Payment session created for BookingId {BookingId}",
                        slotsEvent.BookingId
                    );
                }
                catch (ConsumeException e)
                {
                    _logger.LogError(e, "Kafka ConsumeException. Retrying...");
                    await Task.Delay(5000, stoppingToken);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "JSON deserialize error. Message skipped.");
                    if (consumeResult != null)
                        consumer.Commit(consumeResult);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error. Retrying...");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }
    }
}
