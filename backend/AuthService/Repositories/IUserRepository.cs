using System.Threading.Tasks;
using AuthService.Entities;

namespace AuthService.Repositories
{
  public interface IUserRepository
  {
    Task<UserEntity?> GetUserByIdAsync(Guid id);
    Task<UserEntity?> GetUserByEmailAsync(string email);
    Task CreateUserAsync(UserEntity user);
    Task AddRefreshTokenAsync(UserRefreshTokenEntity refreshToken);
    Task<UserRefreshTokenEntity?> GetRefreshTokenAsync(string token);
  }
}