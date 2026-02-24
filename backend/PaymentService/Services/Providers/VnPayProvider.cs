using PaymentService.Dtos;
using PaymentService.Entities;
using PaymentService.Enums;

namespace PaymentService.Services.Providers;

public class VnPayProvider : IPaymentProvider
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<VnPayLibrary> _vnpayLogger;

    public VnPayProvider(IConfiguration configuration, ILogger<VnPayLibrary> vnpayLogger)
    {
        _configuration = configuration;
        _vnpayLogger = vnpayLogger;
    }

    public PaymentMethod Method => PaymentMethod.VnPay;
    public Task<string> GeneratePaymentLinkAsync(PaymentEntity payment, string ipAddress)
    {
        var vnpay = new VnPayLibrary(_vnpayLogger);
        long vnpAmount = (long)Math.Round(payment.Amount * 100, MidpointRounding.AwayFromZero);

        vnpay.AddRequestData("vnp_Version", "2.1.0");
        vnpay.AddRequestData("vnp_Command", "pay");
        vnpay.AddRequestData("vnp_TmnCode", _configuration["Vnpay:TmnCode"]!);
        vnpay.AddRequestData("vnp_Amount", vnpAmount.ToString());
        vnpay.AddRequestData("vnp_CreateDate", payment.CreatedAt.ToString("yyyyMMddHHmmss"));
        vnpay.AddRequestData("vnp_CurrCode", "VND");
        vnpay.AddRequestData("vnp_IpAddr", ipAddress);
        vnpay.AddRequestData("vnp_Locale", "vn");
        vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan tour booking: {payment.BookingId}");
        vnpay.AddRequestData("vnp_OrderType", "other");
        vnpay.AddRequestData("vnp_ReturnUrl", _configuration["Vnpay:ReturnUrl"]!);
        vnpay.AddRequestData("vnp_TxnRef", payment.Id.ToString());

        string paymentUrl = vnpay.CreateRequestUrl(
            _configuration["Vnpay:BaseUrl"]!, 
            _configuration["Vnpay:HashSecret"]!
        );

        return Task.FromResult(paymentUrl);
    }

    public Task<PaymentCallbackResult> ProcessCallbackAsync(
        PaymentEntity payment,
        object? callbackData = null)
    {
        if (callbackData is not IQueryCollection query)
        {
            return Task.FromResult(
                PaymentCallbackResult.Fail("Invalid callback data"));
        }

        var vnpay = new VnPayLibrary(_vnpayLogger);
        var vnpayData = query.ToDictionary(
            x => x.Key,
            x => x.Value.ToString());

        bool isValidSignature = vnpay.ValidateVnPaySignature(
            vnpayData,
            _configuration["Vnpay:HashSecret"]!
        );

        if (!isValidSignature)
        {
            return Task.FromResult(
                PaymentCallbackResult.Fail("Invalid VNPay signature"));
        }

        if (!decimal.TryParse(query["vnp_Amount"], out var rawAmount))
        {
            return Task.FromResult(
                PaymentCallbackResult.Fail("Invalid amount"));
        }

        decimal paidAmount = rawAmount / 100m;

        if (payment.Amount != paidAmount)
        {
            return Task.FromResult(
                PaymentCallbackResult.Fail("Amount mismatch"));
        }

        string responseCode = query["vnp_ResponseCode"]!;

        if (responseCode != "00")
        {
            return Task.FromResult(
                PaymentCallbackResult.Fail("VNPay payment failed"));
        }

        return Task.FromResult(
            PaymentCallbackResult.Success(
                transactionId: query["vnp_TransactionNo"]!));
    }
}