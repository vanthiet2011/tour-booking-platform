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
            var newBookingEntity = await _bookingService.CreateBookingAsync(userId, createBookingDto);
            var responseDto = _mapper.Map<BookingResponseDto>(newBookingEntity);
            return Ok(responseDto.Id);
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
}