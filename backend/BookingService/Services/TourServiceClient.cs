using System.Text.Json;

namespace BookingService.Services;

public class TourServiceClient : ITourServiceClient
{
    private readonly HttpClient _httpClient;

    public TourServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<TourDepartureDetailsDto?> GetTourDepartureDetailsAsync(Guid tourDepartureId)
    {
        var response = await _httpClient.GetAsync($"/api/tour-departures/{tourDepartureId}");

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        return await response.Content.ReadFromJsonAsync<TourDepartureDetailsDto>(options);
    }
}