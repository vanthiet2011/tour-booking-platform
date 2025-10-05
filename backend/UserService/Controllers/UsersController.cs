using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using UserService.Dtos;
using UserService.Entities;
using UserService.Enums;
using UserService.Repositories;

namespace UserService.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class UsersController : ControllerBase
  {
    private readonly IUserProfileRepository _userProfileRepository;
    public UsersController(IUserProfileRepository userProfileRepository)
    {
      _userProfileRepository = userProfileRepository;
    }
    [HttpPost]
    public async Task<IActionResult> CreateEmptyProfile([FromBody] CreateEmptyProfileDto createDto)
    {
      var existingProfile = await _userProfileRepository.GetUserProfileByIdAsync(createDto.Id);
      if (existingProfile != null)
      {
        return Conflict("User profile already exists.");
      }
      var newProfile = new UserProfileEntity
      {
        Id = createDto.Id,
        FullName = string.Empty,
        PhoneNumber = string.Empty,
        Address = string.Empty,
        AvatarUrl = string.Empty,
        Gender = Gender.Male,
        CreateAt = DateTime.UtcNow
      };
      await _userProfileRepository.CreateUserProfileAsync(newProfile);
      return CreatedAtAction(nameof(GetMyProfile), new { id = newProfile.Id }, newProfile);
    }
    // PUT /api/users/me
    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileDto updateDto)
    {
      var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
      if (string.IsNullOrEmpty(userIdString))
      {
        return Unauthorized("Invalid token.");
      }
      var userId = Guid.Parse(userIdString);
      var userProfile = await _userProfileRepository.GetUserProfileByIdAsync(userId);
      if (userProfile == null)
      {
        return NotFound("User profile not found.");
      }
      userProfile.FullName = updateDto.FullName;
      userProfile.PhoneNumber = updateDto.PhoneNumber;
      userProfile.Address = updateDto.Address;
      userProfile.AvatarUrl = updateDto.AvatarUrl;
      userProfile.Gender = updateDto.Gender;
      userProfile.UpdateAt = DateTime.UtcNow;
      await _userProfileRepository.UpdateUserProfileAsync(userProfile);
      return Ok("Profile updated successfully.");
    }
    
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
      var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
      if (string.IsNullOrEmpty(userIdString))
          return Unauthorized("Invalid token.");

      var userId = Guid.Parse(userIdString);
      var userProfile = await _userProfileRepository.GetUserProfileByIdAsync(userId);
      if (userProfile == null)
          return NotFound("User profile not found.");

      return Ok(userProfile);
    }
  }
}