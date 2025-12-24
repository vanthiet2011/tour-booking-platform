using TourService.Entities;

namespace TourService.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<CategoryEntity>> GetAllAsync();
        Task<CategoryEntity> GetByIdAsync(Guid id);
        Task<CategoryEntity> CreateAsync(CategoryEntity category);
        Task UpdateAsync(CategoryEntity category);
        Task<bool> DeleteAsync(Guid id);
    }
}