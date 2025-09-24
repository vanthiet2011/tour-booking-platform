using System.ComponentModel.DataAnnotations;
using UserService.Enums;

namespace UserService.Entities
{
  public class UserEntity
  {
    public Guid Id { get; set; }
    [Required]
    [MaxLength(100)]
    public string? Name { get; set; }
    [Required]
    [MaxLength(100)]
    public string? Email { get; set; }
    [Required]
    public string? PasswordHash { get; set; }
    [MaxLength(20)]
    public string? Phone { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  }
}