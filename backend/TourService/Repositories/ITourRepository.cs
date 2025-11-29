using TourService.Entities;
using TourService.Models;

namespace TourService.Repositories
{
    public interface ITourRepository
    {
        Task<PaginatedResponse<TourEntity>> GetAllAsync(int page, int pageSize, string? search = null);
        Task<TourEntity?> GetByIdAsync(Guid id);
        Task<List<TourEntity>> GetByDestinationIdAsync(Guid destinationId);
        Task<TourEntity> CreateAsync(TourEntity tour);
        Task<TourEntity> UpdateAsync(TourEntity tour);
        Task<bool> DeleteAsync(Guid id);
    }
}