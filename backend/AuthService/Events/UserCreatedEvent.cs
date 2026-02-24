namespace AuthService.Events
{
    public class UserCreatedEvent
    {
        public Guid UserId { get; set; }
        public string? Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}