using AuthService.Dtos;
using AuthService.Entities;
using AuthService.Enums;
using AuthService.HttpClients;
using AuthService.Repositories;
using BCrypt.Net;

namespace AuthService.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtService _jwtService;
    private readonly KafkaProducerService _kafkaProducer;

    public AuthService(IUserRepository userRepository, JwtService jwtService, KafkaProducerService kafkaProducer)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _kafkaProducer = kafkaProducer;
    }

    public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
    {
        if (await _userRepository.GetByEmailAsync(registerDto.Email!) != null)
        {
            throw new BadHttpRequestException("Email already exists.");
        }
        var user = new UserEntity
        {
            Id = Guid.NewGuid(),
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        await _userRepository.CreateAsync(user);
        var userDto = new UserDto { Id = user.Id, Email = user.Email, Role = user.Role };
        await _kafkaProducer.ProduceAsync(userDto);

        return userDto;
    }

    public async Task<(string AccessToken, string RefreshToken)?> LoginAsync(LoginDto loginDto)
    {
        var user = await _userRepository.GetByEmailAsync(loginDto.Email!);
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return null;
        }
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        var accessToken = _jwtService.GenerateToken(user.Id, user.Email!, user.Role.ToString());
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

        return (accessToken, refreshToken.Token!);
    }

    public async Task<UserDto?> GetUserByIdAsync(string id)
    {
        if (!Guid.TryParse(id, out var userId))
        {
            return null;
        }
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;

        return new UserDto { Id = user.Id, Email = user.Email, Role = user.Role };
    }

    public async Task<UserDto> RegisterAdminAsync(RegisterDto registerDto)
    {
        if (string.IsNullOrWhiteSpace(registerDto.Email) || string.IsNullOrWhiteSpace(registerDto.Password))
            throw new BadHttpRequestException("Email and password are required.");

        if (await _userRepository.GetByEmailAsync(registerDto.Email!) != null)
            throw new BadHttpRequestException("Email already exists.");

        var user = new UserEntity
        {
            Id = Guid.NewGuid(),
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role
        };

        await _kafkaProducer.ProduceAsync(userDto);

        return userDto;
    }
}