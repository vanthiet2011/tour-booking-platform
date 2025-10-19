using System.Threading.Tasks;
using AuthService.Entities;

namespace AuthService.Repositories
{
  public interface IUserRepository
  {
    Task<UserEntity?> GetByIdAsync(Guid id);
    Task<UserEntity?> GetByEmailAsync(string email);
    Task CreateAsync(UserEntity user);
    Task UpdateAsync(UserEntity user);
    Task AddRefreshTokenAsync(UserRefreshTokenEntity refreshToken);
    Task<UserRefreshTokenEntity?> GetRefreshTokenAsync(string token);
  }
}