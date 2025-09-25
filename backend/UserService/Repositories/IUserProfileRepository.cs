
using UserService.Entities;

namespace UserService.Repositories
{
  public interface IUserProfileRepository
{
    Task<UserProfileEntity?> GetUserProfileByIdAsync(Guid id);
    Task CreateUserProfileAsync(UserProfileEntity userProfile);
    Task UpdateUserProfileAsync(UserProfileEntity userProfile);
    Task<bool> ExistsAsync(Guid id);
}
}