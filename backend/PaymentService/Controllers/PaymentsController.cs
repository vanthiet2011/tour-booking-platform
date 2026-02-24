using Microsoft.AspNetCore.Mvc;
using PaymentService.Dtos;
using PaymentService.Services;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }



    [HttpGet("status/{bookingId}")]
    public async Task<IActionResult> GetStatus(Guid bookingId)
    {
        var status =
            await _paymentService.GetPaymentStatusByBookingIdAsync(bookingId);

        if (status == null)
        {
            // Return 200 OK with "Initializing" status to prevent frontend 404 logs during polling
            return Ok(new PaymentStatusDto
            {
                BookingId = bookingId,
                PaymentId = Guid.Empty,
                Status = "Initializing",
                PaymentMethod = "Unknown",
                Amount = 0
            });
        }

        return Ok(status);
    }

    [HttpGet("{paymentId}")]
    public async Task<IActionResult> GetStatusById(Guid paymentId)
    {
        var status = await _paymentService.GetPaymentStatusByIdAsync(paymentId);
        if (status == null) return NotFound();
        return Ok(status);
    }
}
