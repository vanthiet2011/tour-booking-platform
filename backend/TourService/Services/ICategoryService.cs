
using TourService.Dtos;

namespace TourService.Services
{
  public interface ICategoryService
  {
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(Guid id);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto);
    Task UpdateCategoryAsync(Guid id, UpdateCategoryDto dto);
    Task<bool> DeleteCategoryAsync(Guid id);
  }
}