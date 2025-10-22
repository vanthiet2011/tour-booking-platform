using System.ComponentModel.DataAnnotations;

namespace AuthService.Dtos
{
  public class SocialLoginRequestDto
  {
      [Required]
      public string? Token { get; set; }
  }
}