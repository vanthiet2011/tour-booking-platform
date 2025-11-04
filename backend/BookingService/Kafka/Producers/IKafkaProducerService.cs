using BookingService.Events;

namespace BookingService.Kafka.Producers;
public interface IKafkaProducerService
{
    Task ProduceBookingRequestedAsync(BookingRequestedEvent eventData, CancellationToken cancellationToken = default);
    Task ProduceReleaseSlotsRequestedAsync(ReleaseSlotsEvent eventData, CancellationToken cancellationToken = default);
}