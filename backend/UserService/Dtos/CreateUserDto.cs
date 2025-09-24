using System.ComponentModel.DataAnnotations;

namespace UserService.Dtos
{
  public class CreateUserDto
  {
    [Required]
    [EmailAddress]
    public string? Email { get; set; }
    [Required]
    public string? PasswordHash { get; set; }
    [Required]
    public string? Name { get; set; }
    [Required]
    public string? Role { get; set; } 
  }
}