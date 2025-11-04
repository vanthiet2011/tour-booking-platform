using BookingService.Dtos;

namespace BookingService.Services;

public interface ITourServiceClient
{
    Task<TourDepartureDto?> GetTourDepartureAsync(Guid tourDepartureId);
    Task<TourPricingDto?> GetTourPricingAsync(Guid tourId);
}