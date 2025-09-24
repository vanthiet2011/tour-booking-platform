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
      modelBuilder.Entity<UserEntity>(entity =>
      {
        entity.ToTable("Users");
        entity.HasIndex(u => u.Email).IsUnique();
        entity.HasMany(u => u.RefreshTokens)
              .WithOne(rt => rt.User)
              .HasForeignKey(rt => rt.UserId)
              .OnDelete(DeleteBehavior.Cascade);
      });
      modelBuilder.Entity<UserRefreshTokenEntity>(entity =>
      {
         entity.ToTable("UserRefreshTokens");
      });
    }
  }
}