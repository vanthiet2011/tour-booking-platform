using UserService.Enums;

namespace UserService.Dtos
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public UserRole Role { get; set; }
    }
}
