namespace PaymentService.Enums
{
    public enum PaymentStatus
    {
        Pending = 0,          // Online, chờ thanh toán
        AwaitingOffice = 1,   // Offline, chờ đến quầy
        Completed = 2,        // Thành công
        Failed = 3,           // Thanh toán thất bại
        Expired = 4,          // Hết hạn tự động
        Cancelled = 5         // Hủy chủ động
    }
}