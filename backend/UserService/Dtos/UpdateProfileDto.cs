using UserService.Enums;

namespace UserService.Dtos
{
  public class UpdateProfileDto
  {
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? AvatarUrl { get; set; }
    public Gender Gender { get; set; }
  }
}