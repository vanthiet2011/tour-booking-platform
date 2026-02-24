using System.Text.Json;

namespace TourService.Services.External;

public interface IBookingsClient
{
    Task<bool> CheckBookingCompletionAsync(Guid userId, Guid tourId);
}

public class BookingsClient : IBookingsClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BookingsClient> _logger;

    public BookingsClient(HttpClient httpClient, ILogger<BookingsClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> CheckBookingCompletionAsync(Guid userId, Guid tourId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/Bookings/check-completion?userId={userId}&tourId={tourId}");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return bool.Parse(content);
            }
            
            _logger.LogWarning("Failed to check booking completion. StatusCode: {StatusCode}", response.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking booking completion for User {UserId} Tour {TourId}", userId, tourId);
            return false;
        }
    }
}
