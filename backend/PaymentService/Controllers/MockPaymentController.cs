using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System;
using PaymentService.Dtos; // Cần WebhookPayloadDto

namespace PaymentService.Controllers
{
    // Controller này CHỈ DÙNG CHO MỤC ĐÍCH TEST/GIẢ LẬP
    // Nó không phải là một phần của logic nghiệp vụ chính
    [ApiController]
    [Route("mock-payment-page")]
    public class MockPaymentController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<MockPaymentController> _logger;
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };


        public MockPaymentController(IHttpClientFactory httpClientFactory, ILogger<MockPaymentController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // [GET] /mock-payment-page?intentId=...&amount=...&successUrl=...
        // Đây là trang mà PaymentLink trỏ đến
        [HttpGet]
        public IActionResult GetMockPaymentPage(
            [FromQuery] string intentId, 
            [FromQuery] decimal amount, 
            [FromQuery] string successUrl, 
            [FromQuery] string cancelUrl)
        {
            // Trả về một trang HTML đơn giản
            var html = $@"
                <html>
                <head>
                    <title>Thanh toán Giả lập</title>
                    <meta charset='utf-8' />
                </head>
                <body style='font-family: sans-serif; text-align: center; padding: 50px;'>
                    <h2>Cổng Thanh toán Giả lập</h2>
                    <p>Đang thanh toán cho <strong>{intentId}</strong></p>
                    <p>Số tiền: <strong>{amount:N0} VND</strong></p>
                    <hr>
                    <p>Xin hãy chọn kết quả:</p>
                    <form method='post' action='/mock-payment-page/submit'>
                        <input type='hidden' name='intentId' value='{intentId}' />
                        <input type='hidden' name='successUrl' value='{successUrl}' />
                        <input type='hidden' name='cancelUrl' value='{cancelUrl}' />
                        <button type='submit' name='status' value='success' 
                            style='padding: 15px 30px; font-size: 16px; background-color: green; color: white; border: none; cursor: pointer;'>
                            Thanh toán THÀNH CÔNG
                        </button>
                        <button type='submit' name='status' value='fail' 
                            style='padding: 15px 30px; font-size: 16px; background-color: red; color: white; border: none; cursor: pointer; margin-left: 20px;'>
                            Thanh toán THẤT BẠI
                        </button>
                    </form>
                </body>
                </html>";
            
            return Content(html, "text/html");
        }

        // [POST] /mock-payment-page/submit
        // Xảy ra khi người dùng nhấn 1 trong 2 nút
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitMockPayment(
            [FromForm] string intentId, 
            [FromForm] string successUrl, 
            [FromForm] string cancelUrl, 
            [FromForm] string status)
        {
            var payload = new WebhookPayloadDto
            {
                PaymentIntentId = intentId
            };

            if (status == "success")
            {
                payload.EventType = "payment.succeeded";
                payload.TransactionId = $"txn_{Guid.NewGuid():N}";
            }
            else
            {
                payload.EventType = "payment.failed";
                payload.ErrorReason = "Người dùng đã hủy giao dịch (giả lập).";
            }

            // --- Đây là phần quan trọng: MOCK WEBHOOK ---
            // Trang giả lập này sẽ TỰ GỌI VÀO API WEBHOOK THẬT
            try
            {
                var client = _httpClientFactory.CreateClient();
                var jsonPayload = JsonSerializer.Serialize(payload, _jsonOptions);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                
                var webhookUrl = $"http://localhost:8080/api/payments/webhook";
                _logger.LogInformation("Trang giả lập đang gọi Webhook thật: POST {WebhookUrl}", webhookUrl);
                
                var response = await client.PostAsync(webhookUrl, content);
                response.EnsureSuccessStatusCode();
            }
            catch (Exception ex)
            {
                 _logger.LogError(ex, "Lỗi khi trang giả lập gọi webhook thật.");
                 // Vẫn tiếp tục chuyển hướng người dùng
            }

            // Chuyển hướng người dùng về trang kết quả (trên Frontend)
            if (status == "success")
            {
                _logger.LogInformation("Chuyển hướng người dùng về SuccessURL: {SuccessUrl}", successUrl);
                return Redirect(successUrl);
            }
            else
            {
                _logger.LogInformation("Chuyển hướng người dùng về CancelURL: {CancelUrl}", cancelUrl);
                return Redirect(cancelUrl);
            }
        }
    }
}