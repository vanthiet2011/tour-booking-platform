// Trong thư mục Repositories/ITourRepository.cs
using TourService.Entities;

namespace TourService.Repositories
{
    public interface ITourRepository
    {
        Task<IEnumerable<TourEntity>> GetAllAsync();
        Task<TourEntity?> GetByIdAsync(Guid id);
        Task CreateAsync(TourEntity tour);
        Task UpdateAsync(TourEntity tour);
        Task DeleteAsync(Guid id);
    }
}