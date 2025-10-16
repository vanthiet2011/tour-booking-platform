namespace BookingService.Services;

public record TourDepartureDetailsDto(Guid TourId, decimal AdultPrice, decimal ChildPrice);

public interface ITourServiceClient
{
    Task<TourDepartureDetailsDto?> GetTourDepartureDetailsAsync(Guid tourDepartureId);
}