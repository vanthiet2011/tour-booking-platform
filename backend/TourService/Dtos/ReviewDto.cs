using System.ComponentModel.DataAnnotations;

namespace TourService.Dtos;

public class CreateReviewDto
{
    [Required]
    public Guid TourId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    public string? Comment { get; set; }
}

public class ReviewResponseDto
{
    public Guid Id { get; set; }
    public Guid TourId { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? Avatar { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CheckEligibilityResponseDto
{
    public bool CanReview { get; set; }
    public string? Message { get; set; }
}
