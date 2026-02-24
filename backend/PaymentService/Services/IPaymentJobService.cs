namespace PaymentService.Services;

public interface IPaymentJobService
{
    Task CheckAndExpirePayment(Guid paymentId);
}
