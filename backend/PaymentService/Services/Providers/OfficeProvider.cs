using PaymentService.Dtos;
using PaymentService.Entities;
using PaymentService.Enums;

namespace PaymentService.Services.Providers;

public class OfficeProvider : IPaymentProvider
{
    private readonly IConfiguration _config;

    public OfficeProvider(IConfiguration config)
    {
        _config = config;
    }

    public PaymentMethod Method => PaymentMethod.AtOffice;

    public Task<string> GeneratePaymentLinkAsync(PaymentEntity payment, string ipAddress)
    {
        var officeAddress = _config["PaymentSettings:OfficeAddress"]
            ?? "123 Đường ABC, Quận 1, TP. Hồ Chí Minh";

        var hotline = _config["PaymentSettings:Hotline"]
            ?? "1900 xxxx";

        var instruction = $"""
        Thanh toán tại văn phòng

        📍 Địa chỉ: {officeAddress}
        ☎ Hotline: {hotline}

        🧾 Mã thanh toán: {payment.Id}

        ⏳ Vui lòng đến thanh toán trong vòng 24 giờ.
        Sau thời gian này, hệ thống có thể tự động hủy đặt chỗ.
        """;

        return Task.FromResult(instruction);
    }

    public Task<PaymentCallbackResult> ProcessCallbackAsync(
        PaymentEntity payment,
        object? callbackData = null)
    {
        if (callbackData is not OfficeConfirmData)
        {
            return Task.FromResult(PaymentCallbackResult.Fail(
                "Office payment requires manual confirmation"));
        }

        return Task.FromResult(PaymentCallbackResult.Success(
            transactionId: $"OFFICE-{payment.Id}"
        ));
    }
}
