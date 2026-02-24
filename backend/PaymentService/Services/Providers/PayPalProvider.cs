using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using PaymentService.Dtos;
using PaymentService.Entities;
using PaymentService.Enums;

namespace PaymentService.Services.Providers;

public class PayPalProvider : IPaymentProvider
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<PayPalProvider> _logger;

    public PayPalProvider(
        HttpClient httpClient,
        IConfiguration config,
        ILogger<PayPalProvider> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public PaymentMethod Method => PaymentMethod.PayPal;

    public async Task<string> GeneratePaymentLinkAsync(
        PaymentEntity payment,
        string ipAddress)
    {
        decimal exchangeRate = _config.GetValue<decimal>(
            "PaymentSettings:VndToUsdRate");

        decimal amountInUsd = Math.Round(
            payment.Amount / exchangeRate, 2);

        var accessToken = await GetAccessTokenAsync();

        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var orderRequest = new
        {
            intent = "CAPTURE",
            purchase_units = new[]
            {
                new
                {
                    reference_id = payment.Id.ToString(),
                    amount = new
                    {
                        currency_code = "USD",
                        value = amountInUsd.ToString(
                            "F2",
                            System.Globalization.CultureInfo.InvariantCulture)
                    },
                    description = $"Booking {payment.BookingId}"
                }
            }
        };

        var response = await _httpClient.PostAsJsonAsync(
            "/v2/checkout/orders",
            orderRequest);

        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("PayPal CREATE ORDER failed: {Error}", content);
            throw new Exception("PayPal create order failed");
        }

        using var doc = JsonDocument.Parse(content);
        return doc.RootElement.GetProperty("id").GetString()!;
    }

    public async Task<PaymentCallbackResult> ProcessCallbackAsync(
        PaymentEntity payment,
        object? callbackData = null)
    {
        try
        {
            if (callbackData is not PayPalCaptureData data)
            {
                return PaymentCallbackResult.Fail("Invalid PayPal capture data");
            }

            var accessToken = await GetAccessTokenAsync();

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);

            using var requestContent = new StringContent(
                "{}",
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PostAsync(
                $"/v2/checkout/orders/{data.OrderId}/capture",
                requestContent);

            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("PayPal CAPTURE failed: {Error}", content);
                return PaymentCallbackResult.Fail("PayPal capture failed");
            }

            return PaymentCallbackResult.Success(
                transactionId: data.OrderId
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PayPal capture exception");
            return PaymentCallbackResult.Fail(ex.Message);
        }
    }

    private async Task<string> GetAccessTokenAsync()
    {
        try
        {
            var clientId = _config["PayPal:ClientId"];
            var secret = _config["PayPal:Secret"];

            if (string.IsNullOrWhiteSpace(clientId) ||
                string.IsNullOrWhiteSpace(secret))
            {
                _logger.LogError("PayPal ClientId or Secret is missing");
                throw new Exception("PayPal ClientId / Secret is missing");
            }

            var auth = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{clientId}:{secret}")
            );

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "v1/oauth2/token"
            );

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Basic", auth);

            request.Content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials")
            });

            _logger.LogInformation("Sending PayPal token request to {Url}", request.RequestUri);

            var response = await _httpClient.SendAsync(request);

            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("PayPal TOKEN failed: {Error}", content);
                throw new Exception("PayPal token error");
            }

            using var doc = JsonDocument.Parse(content);
            return doc.RootElement
                .GetProperty("access_token")
                .GetString()!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving PayPal access token");
            throw;
        }
    }
}
