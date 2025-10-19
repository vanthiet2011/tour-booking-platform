using AuthService.Dtos;

namespace AuthService.HttpClients;

public interface IUserServiceClient
{
    Task SendUserCreationNotification(UserDto user);
}