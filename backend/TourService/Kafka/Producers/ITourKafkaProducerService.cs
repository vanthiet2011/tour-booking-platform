using TourService.Events;

namespace TourService.Kafka.Producers
{
    public interface ITourKafkaProducerService
    {
        Task ProduceTourCreatedAsync(TourCreatedEvent eventData, CancellationToken cancellationToken = default);
        Task ProduceTourUpdatedAsync(TourUpdatedEvent eventData, CancellationToken cancellationToken = default);
        Task ProduceTourDeletedAsync(TourDeletedEvent eventData, CancellationToken cancellationToken = default);
        Task ProduceSlotsReservedAsync(SlotsReservedEvent eventData, CancellationToken cancellationToken = default);
        Task ProduceSlotsFailedAsync(SlotsFailedEvent eventData, CancellationToken cancellationToken = default);
    }
}