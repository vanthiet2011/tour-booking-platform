using Microsoft.AspNetCore.Mvc;
using PaymentService.Dtos;
using PaymentService.Enums;
using PaymentService.Services;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/paypal")]
public class PayPalController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PayPalController> _logger;

    public PayPalController(
        IPaymentService paymentService,
        ILogger<PayPalController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    [HttpPost("capture")]
    public async Task<IActionResult> Capture(
        [FromBody] PayPalCaptureRequest request)
    {
        _logger.LogInformation(
            "📩 PayPal capture request for PaymentId {PaymentId}",
            request.PaymentId);

        bool success = await _paymentService.CompletePaymentAsync(
            paymentId: request.PaymentId,
            method: PaymentMethod.PayPal,
            callbackData: new PayPalCaptureData
            {
                OrderId = request.PayPalOrderId
            });

        if (!success)
        {
            return BadRequest(new
            {
                message = "PayPal capture failed"
            });
        }

        return Ok(new
        {
            status = "success"
        });
    }
}
