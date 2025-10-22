using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using UserService.Enums;

namespace UserService.Entities
{
  [Table("UserProfiles")]
  public class UserProfileEntity
  {
    [Key]
    public Guid Id { get; set; }
    public string? FullName { get; set; }
    [MaxLength(20)]
    public DateTime? DateOfBirth { get; set; }
    public string? PhoneNumber { get; set; }
    [MaxLength(256)]
    public string? Address { get; set; }
    [MaxLength(256)]
    public string? AvatarUrl { get; set; }
    [Required]
    public Gender Gender { get; set; }
    [Required]
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
  }
}