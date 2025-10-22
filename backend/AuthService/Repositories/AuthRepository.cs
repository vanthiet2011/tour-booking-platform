using Microsoft.EntityFrameworkCore;
using AuthService.Data;
using AuthService.Entities;
using AuthService.Repositories;

namespace UserService.Repositories
{
  public class AuthRepository : IAuthRepository
  {
    private readonly UserDbContext _context;
    public AuthRepository(UserDbContext context)
    {
      _context = context;
    }

    public async Task<UserEntity?> GetByEmailAsync(string email)
    {
      return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task CreateAsync(UserEntity user)
    {
      await _context.Users.AddAsync(user);
      await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(UserEntity user)
    {
      _context.Users.Update(user);
      await _context.SaveChangesAsync();
    }

    public async Task<UserEntity?> GetByIdAsync(Guid id)
    {
      return await _context.Users.FindAsync(id);
    }

    public async Task AddRefreshTokenAsync(UserRefreshTokenEntity refreshToken)
    {
      await _context.UserRefreshTokens.AddAsync(refreshToken);
      await _context.SaveChangesAsync();
    }

    public async Task<UserRefreshTokenEntity?> GetRefreshTokenAsync(string token)
    {
      return await _context.UserRefreshTokens
        .Include(rt => rt.User)
        .FirstOrDefaultAsync(rt => rt.Token == token);
    }
  }
}