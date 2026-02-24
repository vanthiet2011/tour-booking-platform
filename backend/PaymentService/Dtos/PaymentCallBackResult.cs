namespace PaymentService.Dtos;

public class PaymentCallbackResult
{
    public bool IsSuccess { get; init; }
    public string? TransactionId { get; init; }
    public string? ErrorMessage { get; init; }

    private PaymentCallbackResult() { }

    public static PaymentCallbackResult Success(string transactionId)
        => new()
        {
            IsSuccess = true,
            TransactionId = transactionId
        };

    public static PaymentCallbackResult Fail(string errorMessage)
        => new()
        {
            IsSuccess = false,
            ErrorMessage = errorMessage
        };
}
