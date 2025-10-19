using System.Text;
using System.Text.Json;
using AuthService.Dtos;

namespace AuthService.HttpClients;

public class UserServiceClient : IUserServiceClient
{
  private readonly HttpClient _httpClient;
  private readonly ILogger<UserServiceClient> _logger;

  public UserServiceClient(HttpClient httpClient, ILogger<UserServiceClient> logger)
  {
    _httpClient = httpClient;
    _logger = logger;
  }

  public async Task SendUserCreationNotification(UserDto user)
  {
    try
    {
        var content = new StringContent(JsonSerializer.Serialize(user), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("/api/users", content);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("--> Could not send user creation notification to UserService for user {UserId}. Status: {StatusCode}", user.Id, response.StatusCode);
        }
        else
        {
            _logger.LogInformation("--> User creation notification sent successfully for user {UserId}", user.Id);
        }
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "--> An unexpected error occurred while sending user creation notification for user {UserId}", user.Id);
    }
  }
}