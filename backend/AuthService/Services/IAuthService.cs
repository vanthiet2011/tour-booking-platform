using AuthService.Dtos;
using AuthService.Enums; // Đảm bảo using này tồn tại

namespace AuthService.Services;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterDto registerDto);
    Task<UserDto> RegisterAdminAsync(RegisterDto registerDto);
    Task<LoginResponseDto> LoginAsync(LoginDto loginDto);
    Task<UserDto?> GetUserByIdAsync(string id);
    Task<LoginResponseDto> LoginWithGoogleAsync(SocialLoginRequestDto request);
    Task<LoginResponseDto> LoginWithFacebookAsync(SocialLoginRequestDto request);
}