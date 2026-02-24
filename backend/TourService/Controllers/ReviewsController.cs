using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TourService.Dtos;
using TourService.Services;

namespace TourService.Controllers;

[ApiController]
[Route("[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("tour/{tourId}")]
    public async Task<ActionResult<IEnumerable<ReviewResponseDto>>> GetReviews(Guid tourId)
    {
        var reviews = await _reviewService.GetReviewsByTourIdAsync(tourId);
        return Ok(reviews);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewResponseDto>> AddReview([FromBody] CreateReviewDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var review = await _reviewService.AddReviewAsync(userId, dto);
            return CreatedAtAction(nameof(GetReviews), new { tourId = dto.TourId }, review);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("check-eligibility/{tourId}")]
    [Authorize]
    public async Task<ActionResult<CheckEligibilityResponseDto>> CheckEligibility(Guid tourId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var result = await _reviewService.CheckEligibilityAsync(userId, tourId);
        return Ok(result);
    }
}
