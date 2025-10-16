using TourService.Entities;

namespace TourService.Repositories;

public interface ITourDepartureRepository
{
    Task<TourDepartureEntity?> GetByIdWithTourAsync(Guid id);
}