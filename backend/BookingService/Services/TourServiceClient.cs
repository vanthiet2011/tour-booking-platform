using System.Text.Json;
using BookingService.Dtos;

namespace BookingService.Services;

public class TourServiceClient : ITourServiceClient
{
    private readonly HttpClient _httpClient;

    public TourServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<TourDepartureDto?> GetTourDepartureAsync(Guid tourDepartureId)
    {
        var response = await _httpClient.GetAsync($"/TourDepartures/{tourDepartureId}");
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        return await response.Content.ReadFromJsonAsync<TourDepartureDto>(options);
    }

    public async Task<TourPricingDto?> GetTourPricingAsync(Guid tourId)
    {
        var response = await _httpClient.GetAsync($"/Tours/{tourId}");
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        return await response.Content.ReadFromJsonAsync<TourPricingDto>(options);
    }
}