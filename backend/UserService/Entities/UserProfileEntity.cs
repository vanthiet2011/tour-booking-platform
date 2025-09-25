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
    [Required]
    [MaxLength(100)]
    public string? FullName { get; set; }
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
    [MaxLength(256)]
    public string? Address { get; set; }
    [MaxLength(256)]
    public string? AvatarUrl { get; set; }
    [Required]
    public Gender Gender { get; set; }
    [Required]
    public DateTime CreateAt { get; set; }
    public DateTime? UpdateAt { get; set; }
  }
}