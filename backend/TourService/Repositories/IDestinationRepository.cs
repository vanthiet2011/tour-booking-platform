// Trong thư mục Repositories/IDestinationRepository.cs
using TourService.Entities;

namespace TourService.Repositories
{
    public interface IDestinationRepository
    {
        Task<IEnumerable<DestinationEntity>> GetAllAsync();
        Task<IEnumerable<DestinationEntity>> GetPopularAsync(int count);
        Task<DestinationEntity?> GetByIdAsync(Guid id);
        Task CreateAsync(DestinationEntity destination);
        Task UpdateAsync(DestinationEntity destination);
        Task DeleteAsync(Guid id);
    }
}