using BookingService.Events;

namespace BookingService.Kafka.Producers;
public interface IBookingKafkaProducerService
{
    Task ProduceBookingRequestedAsync(BookingRequestedEvent eventData, CancellationToken cancellationToken = default);
    Task ProduceReleaseSlotsRequestedAsync(ReleaseSlotsEvent eventData, CancellationToken cancellationToken = default);
    Task ProduceBookingConfirmedAsync(BookingConfirmedEvent eventData, CancellationToken cancellationToken = default);
    Task ProduceBookingCompletedAsync(BookingCompletedEvent eventData, CancellationToken cancellationToken = default);
    Task ProduceBookingCancelledAsync(BookingCancelledEvent eventData, CancellationToken cancellationToken = default);
    Task ProduceBookingFailedAsync(BookingFailedEvent eventData, CancellationToken cancellationToken = default);
}