namespace PaymentService.Dtos
{
    public class WebhookPayloadDto
    {
        public string EventType { get; set; } = string.Empty;
        public string PaymentIntentId { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public string? ErrorReason { get; set; }
    }
}