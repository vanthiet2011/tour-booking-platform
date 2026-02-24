using BookingService.Dtos;

namespace BookingService.Services;

public interface ITourServiceClient
{
    Task<TourDepartureDto?> GetTourDepartureAsync(Guid tourDepartureId);
    Task<TourPricingDto?> GetTourPricingAsync(Guid tourId);
    Task<Dictionary<Guid, string>> GetTourNamesAsync(IEnumerable<Guid> tourIds);
}