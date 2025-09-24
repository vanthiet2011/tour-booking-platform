
using UserService.Entities;

namespace UserService.Repositories
{
  public interface IUserRepository
  {
    Task<UserEntity?> GetUserByEmailAsync(string email);
    Task CreateUserAsync(UserEntity user);
    Task<UserEntity?> GetUserByIdAsync(Guid id);
  }
}