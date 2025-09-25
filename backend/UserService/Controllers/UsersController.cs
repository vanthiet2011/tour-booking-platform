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
      await _userProfileRepository.UpdateUserProfileAsync(userProfile);
      return Ok("Profile updated successfully.");
    }
  }
}