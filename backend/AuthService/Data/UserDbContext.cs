using Microsoft.EntityFrameworkCore;
using AuthService.Entities;

namespace AuthService.Data
{
  public class UserDbContext : DbContext
  {
    public UserDbContext(DbContextOptions<UserDbContext> options)
      : base(options)
    {
    }

    public DbSet<UserEntity> Users { get; set; }
    public DbSet<UserRefreshTokenEntity> UserRefreshTokens { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);
      modelBuilder.Entity<UserEntity>()
        .HasIndex(u => u.Email)
        .IsUnique();
    }
  }
}