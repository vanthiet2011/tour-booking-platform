using TourService.Entities;

namespace TourService.Repositories;

public interface ITourDepartureRepository
{
  Task<TourDepartureEntity?> GetByIdWithTourAsync(Guid id);
  Task<TourDepartureEntity?> GetByIdAsync(Guid id);
  Task<IEnumerable<TourDepartureEntity>> GetByTourIdAsync(Guid tourId);
  Task<bool> UpdateAsync(TourDepartureEntity entity);
}