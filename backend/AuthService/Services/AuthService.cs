using System.Net.Http.Headers;
using System.Text.Json;
using AuthService.Dtos;
using AuthService.Entities;
using AuthService.Enums;
using AuthService.Repositories;
using BCrypt.Net;
using Google.Apis.Auth;

namespace AuthService.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly JwtService _jwtService;
    private readonly KafkaProducerService _kafkaProducer;
    private readonly HttpClient _httpClient;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public AuthService(
        IAuthRepository authRepository,
        JwtService jwtService,
        IConfiguration configuration,
        KafkaProducerService kafkaProducer,
        IHttpClientFactory httpClientFactory)
    {
        _authRepository = authRepository;
        _jwtService = jwtService;
        _configuration = configuration;
        _kafkaProducer = kafkaProducer;
        _httpClient = new HttpClient();
        _httpClientFactory = httpClientFactory;
    }

    public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
    {
        if (await _authRepository.GetByEmailAsync(registerDto.Email!) != null)
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
        await _authRepository.CreateAsync(user);
        await _kafkaProducer.ProduceAsync(new { user.Id, user.CreatedAt });
        var userDto = new UserDto { Id = user.Id, Email = user.Email, Role = user.Role };
        return userDto;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
    {
        if (string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            throw new BadHttpRequestException("Email and password are required.");

        var user = await _authRepository.GetByEmailAsync(loginDto.Email!);
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            throw new BadHttpRequestException("Invalid email or password.");
            
        user.LastLoginAt = DateTime.UtcNow;
        await _authRepository.UpdateAsync(user);

        var accessToken = _jwtService.GenerateToken(user.Id, user.Email!, user.Role.ToString());
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token!,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role
            }
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(string id)
    {
        if (!Guid.TryParse(id, out var userId))
        {
            return null;
        }
        var user = await _authRepository.GetByIdAsync(userId);
        if (user == null) return null;

        return new UserDto { Id = user.Id, Email = user.Email, Role = user.Role };
    }

    public async Task<UserDto> RegisterAdminAsync(RegisterDto registerDto)
    {
        if (string.IsNullOrWhiteSpace(registerDto.Email) || string.IsNullOrWhiteSpace(registerDto.Password))
            throw new BadHttpRequestException("Email and password are required.");

        if (await _authRepository.GetByEmailAsync(registerDto.Email!) != null)
            throw new BadHttpRequestException("Email already exists.");

        var user = new UserEntity
        {
            Id = Guid.NewGuid(),
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        await _authRepository.CreateAsync(user);

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role
        };

        await _kafkaProducer.ProduceAsync(userDto);

        return userDto;
    }

    public async Task<LoginResponseDto> LoginWithGoogleAsync(SocialLoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            throw new BadHttpRequestException("Missing Google authorization code.");

        var googleClientId = _configuration["Authentication:Google:ClientId"];
        var googleClientSecret = _configuration["Authentication:Google:ClientSecret"];
        var tokenRequest = new Dictionary<string, string>
        {
            {"code", request.Token},
            {"client_id", googleClientId!},
            {"client_secret", googleClientSecret!},
            {"redirect_uri", "postmessage"},
            {"grant_type", "authorization_code"}
        };

        using var client = new HttpClient();
        var response = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(tokenRequest));

        if (!response.IsSuccessStatusCode)
            throw new UnauthorizedAccessException("Failed to exchange authorization code for tokens.");

        var tokenContent = await response.Content.ReadAsStringAsync();
        var tokenJson = JsonSerializer.Deserialize<JsonElement>(tokenContent);

        if (!tokenJson.TryGetProperty("id_token", out var idTokenElement))
            throw new BadHttpRequestException("Google response does not contain id_token.");

        var idToken = idTokenElement.GetString();

        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken!, new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { googleClientId }
        });

        var email = payload.Email;
        var name = payload.Name;
        var picture = payload.Picture;

        var user = await _authRepository.GetByEmailAsync(email);
        if (user == null)
        {
            var registerDto = new RegisterDto
            {
                Email = email,
                Password = Guid.NewGuid().ToString()
            };
            var createdUser = await RegisterAsync(registerDto);
            user = await _authRepository.GetByEmailAsync(createdUser.Email!);
        }

        user!.LastLoginAt = DateTime.UtcNow;
        await _authRepository.UpdateAsync(user);

        var accessToken = _jwtService.GenerateToken(user.Id, user.Email!, user.Role.ToString());
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token!,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role
            }
        };
    }


    // 👇 Thêm hàm LoginWithFacebookAsync
    public async Task<LoginResponseDto> LoginWithFacebookAsync(SocialLoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            throw new BadHttpRequestException("Missing Facebook access token.");

        var fbAppId = _configuration["Authentication:Facebook:AppId"];
        var fbAppSecret = _configuration["Authentication:Facebook:AppSecret"];

        var debugTokenUrl = $"https://graph.facebook.com/debug_token?input_token={request.Token}&access_token={fbAppId}|{fbAppSecret}";
        var debugResult = await _httpClient.GetAsync(debugTokenUrl);
        if (!debugResult.IsSuccessStatusCode) throw new Exception("Invalid Facebook token.");

        var userInfoUrl = $"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={request.Token}";
        var userInfoResult = await _httpClient.GetStringAsync(userInfoUrl);
        var fbUser = JsonSerializer.Deserialize<JsonElement>(userInfoResult);
        string email = fbUser.GetProperty("email").GetString()!;

         var user = await _authRepository.GetByEmailAsync(email);
        if (user == null)
        {
            var registerDto = new RegisterDto
            {
                Email = email,
                Password = Guid.NewGuid().ToString()
            };
            var createdUser = await RegisterAsync(registerDto);
            user = await _authRepository.GetByEmailAsync(createdUser.Email!);
        }

        user!.LastLoginAt = DateTime.UtcNow;
        await _authRepository.UpdateAsync(user);

        var accessJwt = _jwtService.GenerateToken(user.Id, user.Email!, user.Role.ToString());
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

        return new LoginResponseDto
        {
            AccessToken = accessJwt,
            RefreshToken = refreshToken.Token!,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role
            }
        };
    }
}