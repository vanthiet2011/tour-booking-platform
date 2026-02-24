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

    public async Task<Dictionary<Guid, string>> GetTourNamesAsync(IEnumerable<Guid> tourIds)
    {
        if (tourIds == null || !tourIds.Any()) return new Dictionary<Guid, string>();

        var queryString = string.Join("&", tourIds.Select(id => $"ids={id}"));
        
        var response = await _httpClient.GetAsync($"/Tours/batch-names?{queryString}");

        if (response.IsSuccessStatusCode)
        {
            return await response.Content.ReadFromJsonAsync<Dictionary<Guid, string>>() 
                ?? new Dictionary<Guid, string>();
        }

        return new Dictionary<Guid, string>();
    }

}