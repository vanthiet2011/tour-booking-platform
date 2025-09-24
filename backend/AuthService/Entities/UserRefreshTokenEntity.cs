using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Entities
{
  public class UserRefreshTokenEntity
  {
    public Guid Id { get; set; }
    public string? Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    // Foreign key to UserEntity
    public Guid UserId { get; set; }
    public UserEntity? User { get; set; }
  }
}