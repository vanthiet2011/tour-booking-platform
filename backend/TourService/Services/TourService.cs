using TourService.Dtos;
using TourService.Entities;
using TourService.Repositories;
namespace TourService.Services
{
  public class TourService : ITourService
  {
    private readonly ITourRepository _tourRepository;

    public TourService(ITourRepository tourRepository)
    {
        _tourRepository = tourRepository;
    }

    public Task<IEnumerable<TourEntity>> GetAllAsync()
    {
        return _tourRepository.GetAllAsync();
    }

    public Task<TourEntity?> GetByIdAsync(Guid id)
    {
        return _tourRepository.GetByIdAsync(id);
    }

    public Task<TourEntity> CreateAsync(CreateTourDto createTourDto)
    {
        var tourEntity = new TourEntity
        {
            Name = createTourDto.Name,
            Description = createTourDto.Description,
            Price = createTourDto.Price,
            Capacity = createTourDto.Capacity,
            Duration = createTourDto.Duration,
            ImageUrl = createTourDto.ImageUrl,
            IsBestseller = createTourDto.IsBestseller,
            TourDestinations = createTourDto.DestinationIds
                .Select(destId => new TourDestinationEntity { DestinationId = destId }).ToList(),
            TourSchedules = createTourDto.Schedules
                .Select(s => new TourScheduleEntity { DayNumber = s.DayNumber, Title = s.Title, Description = s.Description }).ToList()
        };

        return _tourRepository.CreateAsync(tourEntity);
    }
    
    public async Task<TourEntity?> UpdateAsync(Guid id, UpdateTourDto updateTourDto)
    {
        var existingTour = await _tourRepository.GetByIdAsync(id);
        if (existingTour == null) return null;

        // Map DTO to Entity
        var tourToUpdate = new TourEntity {
            Id = id,
            Name = updateTourDto.Name,
            Description = updateTourDto.Description,
            Price = updateTourDto.Price,
            Capacity = updateTourDto.Capacity,
            Duration = updateTourDto.Duration,
            ImageUrl = updateTourDto.ImageUrl,
            IsBestseller = updateTourDto.IsBestseller,
            TourDestinations = updateTourDto.DestinationIds
                .Select(destId => new TourDestinationEntity { TourId=id, DestinationId = destId }).ToList(),
            TourSchedules = updateTourDto.Schedules
                .Select(s => new TourScheduleEntity { TourId=id, DayNumber = s.DayNumber, Title = s.Title, Description = s.Description }).ToList()
        };
        
        return await _tourRepository.UpdateAsync(tourToUpdate);
    }

    public Task<bool> DeleteAsync(Guid id)
    {
        return _tourRepository.DeleteAsync(id);
    }
  }
}