using Confluent.Kafka; // <-- 1. THÊM USING NÀY
using PaymentService.Events;
using PaymentService.Services;
using System.Text.Json;
using PaymentService.Kafka.Producers;
using PaymentService.Entities;
using PaymentService.Enums;
using PaymentService.Repositories;
using Microsoft.Extensions.Hosting; // (Các using cần thiết khác)
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

// 2. Đảm bảo namespace đúng
namespace PaymentService.Kafka.Consumers 
{
    public class PaymentCreationConsumer : BackgroundService
    {
        private readonly ILogger<PaymentCreationConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly string _topic = "slots.reserved";
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };


        public PaymentCreationConsumer(
            IServiceScopeFactory scopeFactory,
            ILogger<PaymentCreationConsumer> logger,
            IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
             _logger.LogInformation("🎧 (PaymentCreationConsumer) Subscribed to topic: {Topic}", _topic);
            
            var config = new ConsumerConfig
            {
                BootstrapServers = _configuration["Kafka:BootstrapServers"],
                GroupId = "payment-creation-group",
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
                    _logger.LogInformation("📩 (PaymentCreationConsumer) Received message from topic {Topic}", consumeResult.Topic);

                    var slotsEvent = JsonSerializer.Deserialize<SlotsReservedEvent>(message, _jsonOptions);

                    if (slotsEvent != null)
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var paymentService = scope.ServiceProvider.GetRequiredService<IPaymentService>();
                        var kafkaProducer = scope.ServiceProvider.GetRequiredService<IPaymentKafkaProducerService>();

                        var newPayment = await paymentService.CreatePaymentSessionAsync(slotsEvent);

                        var paymentInitiatedEvent = new InitiatePaymentEvent
                        {
                            BookingId = newPayment.BookingId,
                            PaymentId = newPayment.Id,
                            PaymentLink = newPayment.PaymentLink ?? "",
                            ClientSecret = newPayment.PaymentIntentId ?? ""
                        };

                        await kafkaProducer.ProduceInitiatePaymentAsync(paymentInitiatedEvent, stoppingToken);

                        consumer.Commit(consumeResult);
                    }
                    else
                    {
                        _logger.LogWarning("❌ (PaymentCreationConsumer) Deserialize SlotsReservedEvent ra null. Bỏ qua message.");
                        consumer.Commit(consumeResult);
                    }
                }
                catch (ConsumeException e)
                {
                    if (e.Error.Code == ErrorCode.UnknownTopicOrPart)
                    {
                        _logger.LogWarning("⚠️ (PaymentCreationConsumer) Topic {Topic} chưa sẵn sàng. Đang chờ 5s...", _topic);
                        await Task.Delay(5000, stoppingToken);
                    }
                    else
                    {
                        _logger.LogError(e, "Kafka ConsumeException in PaymentCreationConsumer. Retrying in 5s...");
                        await Task.Delay(5000, stoppingToken);
                    }
                }
                catch (JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "❌ (PaymentCreationConsumer) Lỗi deserialize message. Bỏ qua. Message: {Message}", consumeResult?.Message.Value);
                    if (consumeResult != null)
                        consumer.Commit(consumeResult);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ (PaymentCreationConsumer) Lỗi nghiêm trọng khi xử lý 'slots.reserved'. Message sẽ được thử lại.");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }
    }
}