using UserService.Dtos;
using UserService.Entities;

namespace UserService.Services;

public interface IUserProfileService
{
    Task<UserProfileEntity?> GetProfileByUserIdAsync(Guid userId);
    Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto updateDto);
    Task CreateProfileFromEventAsync(UserCreatedDto userDto);
}