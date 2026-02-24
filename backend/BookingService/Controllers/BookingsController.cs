using AutoMapper;
using BookingService.Dtos;
using BookingService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookingService.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IMapper _mapper;

    public BookingsController(IBookingService bookingService, IMapper mapper)
    {
        _bookingService = bookingService;
        _mapper = mapper;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<PaginatedResponseDto<BookingSummaryResponseDto>>> GetAllForAdmin(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        var result = await _bookingService.GetAllBookingsAsync(page, pageSize);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto createBookingDto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("UserId không hợp lệ hoặc không được cung cấp.");
        }
        try
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var newBookingEntity = await _bookingService.CreateBookingAsync(userId, createBookingDto, ipAddress);
            var responseDto = _mapper.Map<BookingResponseDto>(newBookingEntity);
            return Ok(new { id = responseDto.Id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookingResponseDto>> GetBookingById(Guid id)
    {
        var bookingResponse = await _bookingService.GetBookingByIdAsync(id);
        if (bookingResponse == null)
        {
            return NotFound("Không tìm thấy booking.");
        }
        return Ok(bookingResponse);
    }

    [HttpGet("my-bookings")]
    public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetMyBookings()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("Token không hợp lệ hoặc không chứa UserId.");
        }

        if (!Guid.TryParse(userIdString, out var userId))
        {
            return BadRequest("UserId trong token không hợp lệ (không phải GUID).");
        }

        var bookings = await _bookingService.GetBookingsByUserIdAsync(userId);
        return Ok(bookings);
    }
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelBooking(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Token không hợp lệ.");
        }

        try
        {
            await _bookingService.CancelBookingAsync(id, userId);
            return Ok(new { message = "Đã hủy booking thành công." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}/cancel-admin")]
    public async Task<IActionResult> CancelBookingByAdmin(Guid id, [FromQuery] string reason = "Admin Cancelled")
    {
        try
        {
            await _bookingService.CancelBookingByAdminAsync(id, reason);
            return Ok(new { message = "Đã hủy booking thành công (Admin)." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("check-completion")]
    [AllowAnonymous] // Assuming TourService will call this internally or we trust the caller. Ideally authorize with service-to-service token or specific role.
    // However, since this is just checking "if a user has completed a tour", maybe allow logged in users to check for themselves?
    // Actually, TourService will call this. Let's keep it open or require a specific policy. 
    // For simplicity given the microservice context usually hidden behind gateway or internal network, we can keep it accessible or add [Authorize].
    // If TourService calls it via HttpClient, it might not pass user token.
    public async Task<ActionResult<bool>> CheckCompletion([FromQuery] Guid userId, [FromQuery] Guid tourId)
    {
        var hasCompleted = await _bookingService.HasCompletedBookingAsync(userId, tourId);
        return Ok(hasCompleted);
    }
}