using TourService.Entities;

namespace TourService.Repositories
{
    public interface ITourRepository
    {
        Task<IEnumerable<TourEntity>> GetAllAsync();
        Task<TourEntity?> GetByIdAsync(Guid id);
        Task<List<TourEntity>> GetByDestinationIdAsync(Guid destinationId);
        Task<TourEntity> CreateAsync(TourEntity tour);
        Task<TourEntity> UpdateAsync(TourEntity tour);
        Task<bool> DeleteAsync(Guid id);
    }
}