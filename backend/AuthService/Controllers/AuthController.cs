using Microsoft.AspNetCore.Mvc;
using AuthService.Dtos;
using AuthService.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using AuthService.Enums;

namespace AuthService.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
      _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
      try
      {
        var userDto = await _authService.RegisterAsync(registerDto);
        return CreatedAtAction(nameof(GetUserById), new { id = userDto.Id }, userDto);
      }
      catch (BadHttpRequestException ex)
      {
        return BadRequest(new { message = ex.Message });
      }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
      try
      {
        var response = await _authService.LoginAsync(loginDto);
        return Ok(response);
      }
      catch (BadHttpRequestException ex)
      {
        return Unauthorized(new { message = ex.Message });
      }
    }

    [HttpPost("login/google")]
    public async Task<IActionResult> LoginWithGoogle([FromBody] SocialLoginRequestDto request)
    {
      try
      {
        var response = await _authService.LoginWithGoogleAsync(request);
        return Ok(response);
      }
      catch (BadHttpRequestException ex)
      {
        return Unauthorized(new { message = ex.Message });
      }
      catch (Exception)
      {
        return Unauthorized(new { message = "Invalid Google token." });
      }
    }
    
    [HttpPost("login/facebook")]
    public async Task<IActionResult> LoginWithFacebook([FromBody] SocialLoginRequestDto request)
    {
      try
      {
        var response = await _authService.LoginWithFacebookAsync(request);
        return Ok(response);
      }
      catch (BadHttpRequestException ex)
      {
        return BadRequest(new { message = ex.Message });
      }
      catch (Exception)
      {
        return Unauthorized(new { message = "Invalid Facebook token." });
      }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Unauthorized();

      var userDto = await _authService.GetUserByIdAsync(userId);
      return userDto == null ? NotFound() : Ok(userDto);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetUserById(Guid id)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

      if (currentUserRole != UserRole.Admin.ToString() && currentUserId != id.ToString())
      {
          return Forbid();
      }

      var userDto = await _authService.GetUserByIdAsync(id.ToString());
      return userDto == null ? NotFound() : Ok(userDto);
    }
    
    [HttpPost("create-admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAdmin([FromBody] RegisterDto registerDto)
    {
      try
      {
        var userDto = await _authService.RegisterAdminAsync(registerDto);
        return CreatedAtAction(nameof(GetUserById), new { id = userDto.Id }, userDto);
      }
      catch (BadHttpRequestException ex)
      {
        return BadRequest(new { message = ex.Message });
      }
    }
}