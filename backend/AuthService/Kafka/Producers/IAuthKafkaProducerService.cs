using AuthService.Events;

namespace AuthService.Services.Interfaces
{
    public interface IAuthKafkaProducerService
    {
        Task ProduceUserCreatedAsync(UserCreatedEvent eventData, CancellationToken cancellationToken = default);
    }
}