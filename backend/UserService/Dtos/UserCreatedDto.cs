namespace UserService.Dtos;

public class UserCreatedDto
    {
        public Guid UserId { get; set; } 
        public string? Email { get; set; }
        public DateTime CreatedAt { get; set; }
    }