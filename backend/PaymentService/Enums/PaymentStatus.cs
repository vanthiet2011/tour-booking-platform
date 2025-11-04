namespace PaymentService.Enums
{
    public enum PaymentStatus
    {
        Pending,    // Vừa tạo, chờ khách hàng thanh toán
        Succeeded,  // Thanh toán thành công
        Failed,     // Thanh toán thất bại (từ cổng thanh toán)
        Expired,    // Phiên thanh toán/link hết hạn
        Refunded    // Đã hoàn tiền
    }
}