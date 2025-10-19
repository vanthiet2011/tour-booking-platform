
using UserService.Entities;

namespace UserService.Repositories
{
  public interface IUserProfileRepository
{
    Task<UserProfileEntity?> GetByIdAsync(Guid id);
    Task CreateAsync(UserProfileEntity userProfile);
    Task UpdateAsync(UserProfileEntity userProfile);
    Task<bool> ExistsAsync(Guid id);
}
}