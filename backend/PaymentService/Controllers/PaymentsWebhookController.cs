using Microsoft.AspNetCore.Mvc;
using PaymentService.Dtos;
using PaymentService.Services;
using System;
using System.Threading.Tasks;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentsWebhookController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentsWebhookController> _logger;

        public PaymentsWebhookController(IPaymentService paymentService, ILogger<PaymentsWebhookController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> HandleWebhook([FromBody] WebhookPayloadDto payload)
        {
            _logger.LogInformation("--- Webhook Endpoint ĐÃ NHẬN ĐƯỢC YÊU CẦU ---");
            _logger.LogInformation("Payload: {@Payload}", payload);

            // (Trong thực tế, bạn PHẢI xác thực chữ ký của webhook ở đây)
            // if (!IsValidStripeSignature(Request))
            // {
            //     _logger.LogWarning("Webhook signature không hợp lệ!");
            //     return BadRequest("Invalid signature.");
            // }

            try
            {
                // Chuyển payload cho service xử lý
                await _paymentService.HandleWebhookPayloadAsync(payload);
                _logger.LogInformation("--- Webhook đã xử lý. Trả về 200 OK cho cổng thanh toán ---");
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi nghiêm trọng khi xử lý Webhook. Trả về 500.");
                return StatusCode(500, "Lỗi máy chủ nội bộ");
            }
        }
    }
}