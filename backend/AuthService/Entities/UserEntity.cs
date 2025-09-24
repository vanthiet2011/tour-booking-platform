using System;
using System.ComponentModel.DataAnnotations;
using AuthService.Enums;

namespace AuthService.Entities
{
  public class UserEntity
  {
    [Key]
    public Guid Id { get; set; }
    [Required]
    [MaxLength(256)]
    public string? Email { get; set; }
    [Required]
    public string? PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public bool IsEmailConfirmed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    public ICollection<UserRefreshTokenEntity>? RefreshTokens { get; set; } = new List<UserRefreshTokenEntity>();
  }
}