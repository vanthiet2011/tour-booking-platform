using TourService.Events;

namespace TourService.Kafka.Producers
{
    public interface ITourKafkaProducerService
    {
        Task ProduceSlotsReservedAsync(SlotsReservedEvent eventData, CancellationToken cancellationToken = default);
        Task ProduceSlotsFailedAsync(SlotsFailedEvent eventData, CancellationToken cancellationToken = default);
    }
}