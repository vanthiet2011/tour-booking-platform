using TourService.Dtos;
using TourService.Entities;
using TourService.Events;

namespace TourService.Services
{
  public interface ITourService
  {
      Task<IEnumerable<TourDetailDto>> GetAllAsync();
      Task<TourDetailDto?> GetByIdAsync(Guid id);
      Task<IEnumerable<TourDetailDto>> GetByDestinationIdAsync(Guid destinationId);
      Task<TourEntity> CreateAsync(CreateTourDto createTourDto);
      Task<TourEntity?> UpdateAsync(Guid id, UpdateTourDto updateTourDto);
      Task<bool> DeleteAsync(Guid id);
      Task HandleBookingRequestAsync(BookingRequestedEvent bookingEvent);
      Task HandleReleaseSlotsAsync(ReleaseSlotsEvent releaseEvent);
  }
}