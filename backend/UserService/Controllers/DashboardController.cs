using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using UserService.Dtos;

[ApiController]
[Route("[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly UserDbContext _context;
    public DashboardController(UserDbContext context) => _context = context;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _context.DashboardStats.AsNoTracking().FirstOrDefaultAsync();
        var regionJson = string.IsNullOrEmpty(stats?.RegionDistribution) ? "{}" : stats.RegionDistribution;
        var dict = JsonSerializer.Deserialize<Dictionary<string, int>>(regionJson);
        var formattedData = dict?.Select(x => new { name = x.Key, value = x.Value }).ToList();

        var paymentJson = string.IsNullOrEmpty(stats?.PaymentMethodDistribution) ? "{}" : stats.PaymentMethodDistribution;
        var paymentDict = JsonSerializer.Deserialize<Dictionary<string, int>>(paymentJson);
        var formattedPaymentData = paymentDict?.Select(x => new { name = x.Key, value = x.Value }).ToList();

        return Ok(new {
            totalTours = stats?.TotalTours ?? 0,
            totalUsers = stats?.TotalUsers ?? 0,
            totalBookings = stats?.TotalBookings ?? 0,
            totalRevenue = stats?.TotalRevenue ?? 0,
            regionData = formattedData,
            paymentMethodData = formattedPaymentData,
            recentBookings = string.IsNullOrEmpty(stats?.RecentBookings) 
            ? new List<RecentBookingDto>() 
            : JsonSerializer.Deserialize<List<RecentBookingDto>>(stats.RecentBookings, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }),
            topBookedTours = string.IsNullOrEmpty(stats?.TopBookedTours)
            ? new List<TopTourDto>()
            : JsonSerializer.Deserialize<List<TopTourDto>>(stats.TopBookedTours, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
        });
    }
}