using System.Security.Claims;
using System.Text.Json;
using AuthService.Dtos;
using AuthService.Entities;
using AuthService.Enums;
using AuthService.Repositories;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : ControllerBase
  {
    private readonly JwtService _jwtService;
    private readonly IUserRepository _userRepository;
    public AuthController(JwtService jwtService, IUserRepository userRepository)
    {
      _jwtService = jwtService;
      _userRepository = userRepository;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto regisDto)
    {
      var existingUser = await _userRepository.GetUserByEmailAsync(regisDto.Email!);
      if (existingUser != null)
      {
        return Conflict("Email already exists");
      }
      var hashedPassword = BCrypt.Net.BCrypt.HashPassword(regisDto.Password);
      var user = new UserEntity
      {
        Id = Guid.NewGuid(),
        Email = regisDto.Email,
        PasswordHash = hashedPassword,
        Role = UserRole.Customer,
        CreatedAt = DateTime.UtcNow
      };
      await _userRepository.CreateUserAsync(user);
      try
      {
        var httpClient = new HttpClient();
        var createProfileDto = new { Id = user.Id };
        var content = new StringContent(JsonSerializer.Serialize(createProfileDto), System.Text.Encoding.UTF8, "application/json");
        var response = await httpClient.PostAsync("http://user-service:8080/api/users", content);
      }
      catch (Exception ex)
      {
        Console.WriteLine($"--> Could not create profile for user {user.Id}: {ex.Message}");
      }
      var UserDto = new UserDto
      {
        Id = user.Id,
        Email = user.Email,
        Role = user.Role
      };
      return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, UserDto);
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
      var user = await _userRepository.GetUserByEmailAsync(loginDto.Email!);
      if (user == null)
      {
        return Unauthorized("Invalid credentials.");
      }
      var isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash!);
      if (!isPasswordValid)
      {
        return Unauthorized("Invalid credentials.");
      }
      var accessToken = _jwtService.GenerateToken(user.Id, user.Email!, user.Role.ToString());
      var refreshToken = _jwtService.GenerateRefreshToken(user.Id);
      await _userRepository.AddRefreshTokenAsync(refreshToken);
      return Ok(new
      {
        AccessToken = accessToken,
        RefreshToken = refreshToken.Token
      });
    }

    // GET: api/Users/{id}
    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id)
    {
      var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
      var role = User.FindFirst(ClaimTypes.Role)?.Value;
      if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
        return Unauthorized("Invalid token");
      if (role != UserRole.Admin.ToString() && userId != id.ToString())
        return Forbid();
      var user = await _userRepository.GetUserByIdAsync(id);
      if (user == null) return NotFound("User not found");
      return new UserDto
      {
        Id = user.Id,
        Email = user.Email,
        Role = user.Role
      };
    }

    // GET: api/auth/me
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
      // Lấy userId từ claim trong JWT
      var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
      if (string.IsNullOrEmpty(userId))
        return Unauthorized("Invalid token");

      var user = await _userRepository.GetUserByIdAsync(Guid.Parse(userId));
      if (user == null)
        return NotFound("User not found");

      return new UserDto
      {
        Id = user.Id,
        Email = user.Email,
        Role = user.Role
      };
    }
    
    [HttpPost("create-admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAdmin([FromBody] RegisterDto regisDto)
    {
      var existingUser = await _userRepository.GetUserByEmailAsync(regisDto.Email!);
      if (existingUser != null)
      {
          return Conflict("Email already exists");
      }

      var hashedPassword = BCrypt.Net.BCrypt.HashPassword(regisDto.Password);
      var user = new UserEntity
      {
          Id = Guid.NewGuid(),
          Email = regisDto.Email,
          PasswordHash = hashedPassword,
          Role = UserRole.Admin,
          CreatedAt = DateTime.UtcNow
      };
      await _userRepository.CreateUserAsync(user);

      try
      {
        var httpClient = new HttpClient();
        var createProfileDto = new { Id = user.Id };
        var content = new StringContent(JsonSerializer.Serialize(createProfileDto), System.Text.Encoding.UTF8, "application/json");
        var response = await httpClient.PostAsync("http://user-service:8080/api/users", content);
      }
      catch (Exception ex)
      {
        Console.WriteLine($"--> Could not create profile for user {user.Id}: {ex.Message}");
      }
      var UserDto = new UserDto
      {
        Id = user.Id,
        Email = user.Email,
        Role = user.Role
      };
      return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, UserDto);
    }
  }

}