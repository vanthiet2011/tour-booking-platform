using AuthService.Enums;

namespace AuthService.Dtos
{ 
  public class UserDto
  {
    public Guid Id { get; set; }
    public string? Email { get; set; }
    public UserRole Role { get; set; }
  }
}
