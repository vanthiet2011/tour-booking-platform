using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Entities;

namespace UserService.Repositories
{
  public class UserRepository : IUserRepository
  {
    private readonly UserDbContext _context;
    public UserRepository(UserDbContext context)
    {
      _context = context;
    }

    public async Task<UserEntity?> GetUserByEmailAsync(string email)
    {
      return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task CreateUserAsync(UserEntity user)
    {
      await _context.Users.AddAsync(user);
      await _context.SaveChangesAsync();
    }

    public async Task<UserEntity?> GetUserByIdAsync(Guid id)
    {
      return await _context.Users.FindAsync(id);
    }
  }
}