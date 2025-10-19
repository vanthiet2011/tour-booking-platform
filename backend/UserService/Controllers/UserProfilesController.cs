using Microsoft.AspNetCore.Mvc;
using UserService.Dtos;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using UserService.Services; // Thêm using này

namespace UserService.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserProfilesController : ControllerBase
{
    private readonly IUserProfileService _userProfileService;

    public UserProfilesController(IUserProfileService userProfileService)
    {
        _userProfileService = userProfileService;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Invalid user ID in token.");
        }

        var profile = await _userProfileService.GetProfileByUserIdAsync(userId);
        return profile == null ? NotFound() : Ok(profile);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileDto updateDto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Invalid user ID in token.");
        }
        var success = await _userProfileService.UpdateProfileAsync(userId, updateDto);
        return success ? NoContent() : NotFound();
    }
}