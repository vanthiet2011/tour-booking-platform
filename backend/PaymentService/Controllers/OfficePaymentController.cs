using Microsoft.AspNetCore.Mvc;
using PaymentService.Dtos;
using PaymentService.Enums;
using PaymentService.Services;

[ApiController]
[Route("api/payments/office")]
public class OfficePaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public OfficePaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmPayment(
        [FromBody] OfficeConfirmRequest request)
    {
        try
        {
            var paymentStatus = await _paymentService.GetPaymentStatusByBookingIdAsync(request.BookingId);
            if (paymentStatus == null)
            {
                 return NotFound("Không tìm thấy thông tin thanh toán cho booking này.");
            }

            // 2. Complete the payment
            var result = await _paymentService.CompletePaymentAsync(
                paymentId: paymentStatus.PaymentId,
                method: PaymentMethod.AtOffice,
                callbackData: new OfficeConfirmData
                {
                    StaffId = request.StaffId ?? "admin" // Default if missing
                });

            return result ? Ok() : BadRequest("Failed to complete payment");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
