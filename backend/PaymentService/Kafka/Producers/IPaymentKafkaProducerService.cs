using PaymentService.Events;

namespace PaymentService.Kafka.Producers
{
    public interface IPaymentKafkaProducerService
    {
        Task ProducePaymentCreatedAsync(PaymentCreatedEvent eventData, CancellationToken cancellationToken = default);
        Task ProducePaymentSucceededAsync(PaymentSucceededEvent eventData, CancellationToken cancellationToken = default);
        Task ProducePaymentFailedAsync(PaymentFailedEvent eventData, CancellationToken cancellationToken = default);
    }
}