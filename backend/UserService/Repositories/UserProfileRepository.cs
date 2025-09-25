// UserService/Repositories/UserProfileRepository.cs
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Entities;
using UserService.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly UserDbContext _context;

    public UserProfileRepository(UserDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileEntity?> GetUserProfileByIdAsync(Guid id)
    {
        return await _context.UserProfiles.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task CreateUserProfileAsync(UserProfileEntity userProfile)
    {
        await _context.UserProfiles.AddAsync(userProfile);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateUserProfileAsync(UserProfileEntity userProfile)
    {
        userProfile.UpdateAt = DateTime.UtcNow;
        _context.UserProfiles.Update(userProfile);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.UserProfiles.AnyAsync(p => p.Id == id);
    }
}