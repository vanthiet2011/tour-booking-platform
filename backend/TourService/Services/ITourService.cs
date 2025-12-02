using TourService.Dtos;
using TourService.Entities;
using TourService.Events;
using TourService.Models;

namespace TourService.Services
{
  public interface ITourService
  {
      Task<PaginatedResponse<TourListDto>> GetAllToursAsync(
        int page, 
        int pageSize, 
        string? search = null, 
        decimal? minPrice = null, 
        decimal? maxPrice = null,
        int ? minDurationDays = null,
        int ? maxDurationDays = null,
        string? region = null,
        Guid? destinationId = null);
      Task<TourDetailDto> GetTourByIdAsync(Guid id);
      Task<IEnumerable<TourDetailDto>> GetByDestinationIdAsync(Guid destinationId);
      Task<TourDetailDto> CreateTourAsync(CreateTourDto createTourDto);
      Task<bool> UpdateTourAsync(Guid id, UpdateTourDto updateTourDto);
      Task<bool> DeleteTourAsync(Guid id);
      Task HandleBookingRequestAsync(BookingRequestedEvent bookingEvent);
      Task HandleReleaseSlotsAsync(ReleaseSlotsEvent releaseEvent);
  }
}