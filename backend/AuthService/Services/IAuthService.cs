using AuthService.Dtos;
using AuthService.Enums; // Đảm bảo using này tồn tại

namespace AuthService.Services;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterDto registerDto);
    Task<UserDto> RegisterAdminAsync(RegisterDto registerDto);
    Task<(string AccessToken, string RefreshToken)?> LoginAsync(LoginDto loginDto);
    Task<UserDto?> GetUserByIdAsync(string id);
}