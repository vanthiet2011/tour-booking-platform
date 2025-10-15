using AutoMapper;
using TourService.Dtos;
using TourService.Entities;
using TourService.Repositories;

namespace TourService.Services
{
  public class TourService : ITourService
  {
    private readonly ITourRepository _tourRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<TourService> _logger;

    public TourService(ITourRepository tourRepository, IMapper mapper, ILogger<TourService> logger)
    {
      _tourRepository = tourRepository;
      _mapper = mapper;
      _logger = logger;

    }

    public async Task<IEnumerable<TourDetailDto>> GetAllAsync()
    {
      var tourEntitties = await _tourRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<TourDetailDto>>(tourEntitties);
    }

    public async Task<TourDetailDto?> GetByIdAsync(Guid id)
    {
      var tourEntity = await _tourRepository.GetByIdAsync(id);
      if (tourEntity == null)
      {
          return null;
      }
      return _mapper.Map<TourDetailDto>(tourEntity);
    }
    
    public async Task<IEnumerable<TourDetailDto>> GetByDestinationIdAsync(Guid destinationId)
    {
      var tourEntities = await _tourRepository.GetByDestinationIdAsync(destinationId);
      try
      {
        var tourDtos = _mapper.Map<IEnumerable<TourDetailDto>>(tourEntities);
        return tourDtos;
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Lỗi nghiêm trọng khi mapping TourEntity sang TourDetailDto cho destination ID: {DestinationId}", destinationId);
        throw;
      }
    }

    public async Task<TourEntity> CreateAsync(CreateTourDto createTourDto)
    {
      var tourEntity = _mapper.Map<TourEntity>(createTourDto);
      foreach (var departure in tourEntity.TourDepartures)
      {
          departure.StartDate = DateTime.SpecifyKind(departure.StartDate, DateTimeKind.Utc);
          departure.EndDate = DateTime.SpecifyKind(departure.EndDate, DateTimeKind.Utc);
      }
      return await _tourRepository.CreateAsync(tourEntity);
    }
    
    public async Task<TourEntity?> UpdateAsync(Guid id, UpdateTourDto updateTourDto)
    {
      var tourToUpdate = _mapper.Map<TourEntity>(updateTourDto);
      tourToUpdate.Id = id;
      foreach (var departure in tourToUpdate.TourDepartures)
      {
        departure.StartDate = DateTime.SpecifyKind(departure.StartDate, DateTimeKind.Utc);
        departure.EndDate = DateTime.SpecifyKind(departure.EndDate, DateTimeKind.Utc);
      }
      try
      {
        return await _tourRepository.UpdateAsync(tourToUpdate);
      }
      catch (KeyNotFoundException)
      {
        return null;
      }
    }

    public Task<bool> DeleteAsync(Guid id)
    {
        return _tourRepository.DeleteAsync(id);
    }
  }
}