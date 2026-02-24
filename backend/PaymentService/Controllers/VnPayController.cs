using Microsoft.AspNetCore.Mvc;
using PaymentService.Enums;
using PaymentService.Services;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/vnpay")]
public class VnPayController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<VnPayController> _logger;

    public VnPayController(
        IPaymentService paymentService,
        ILogger<VnPayController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }
    
    [HttpGet("ipn")]
    public async Task<IActionResult> VnPayIpn()
    {
        try
        {
            _logger.LogInformation(
                "📩 VNPay IPN received at {Time}",
                DateTime.UtcNow);

            if (!Guid.TryParse(
                    Request.Query["vnp_TxnRef"],
                    out var paymentId))
            {
                _logger.LogWarning("❌ Invalid vnp_TxnRef");

                return Ok(new
                {
                    RspCode = "01",
                    Message = "Invalid Order"
                });
            }

            bool success = await _paymentService.CompletePaymentAsync(
                paymentId: paymentId,
                method: PaymentMethod.VnPay,
                callbackData: Request.Query
            );

            if (!success)
            {
                return Ok(new
                {
                    RspCode = "97",
                    Message = "Invalid Signature or Payment Failed"
                });
            }

            return Ok(new
            {
                RspCode = "00",
                Message = "Confirm Success"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VNPay IPN Exception");

            return Ok(new
            {
                RspCode = "99",
                Message = "Unknown Error"
            });
        }
    }
}
