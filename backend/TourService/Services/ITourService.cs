using TourService.Dtos;
using TourService.Entities;

namespace TourService.Services
{
  public interface ITourService
  {
      Task<IEnumerable<TourEntity>> GetAllAsync();
      Task<TourEntity?> GetByIdAsync(Guid id);
      Task<IEnumerable<TourEntity>> GetByDestinationIdAsync(Guid destinationId);
      Task<TourEntity> CreateAsync(CreateTourDto createTourDto);
      Task<TourEntity?> UpdateAsync(Guid id, UpdateTourDto updateTourDto);
      Task<bool> DeleteAsync(Guid id);
  }
}