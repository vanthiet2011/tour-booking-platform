namespace UserService.Entities
{
    public class DashboardStatsEntity
    {
        public int Id { get; set; } = 1; 
        public int TotalTours { get; set; }
        public int TotalBookings { get; set; }
        public int TotalUsers { get; set; }
        public decimal TotalRevenue { get; set; }
        public string RegionDistribution { get; set; } = "{}";
        public string? RecentBookings { get; set; }
        public string TopBookedTours { get; set; } = "[]";
        public string PaymentMethodDistribution { get; set; } = "{}";
        public DateTime LastUpdated { get; set; }
    }
}