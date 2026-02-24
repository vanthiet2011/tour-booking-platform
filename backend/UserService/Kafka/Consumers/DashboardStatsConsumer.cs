using Confluent.Kafka;
using System.Text.Json;
using UserService.Data;
using UserService.Entities;
using Microsoft.EntityFrameworkCore;
using UserService.Events;
using UserService.Dtos;

namespace UserService.Kafka.Consumers
{
    public class DashboardStatsConsumer : BackgroundService
    {
        private readonly ILogger<DashboardStatsConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;

        private readonly string[] _topics = { 
            "dev.vietnature.tour-service.tour.created", 
            "dev.vietnature.auth-service.user.created",
            "dev.vietnature.booking-service.booking.requested",
            "dev.vietnature.booking-service.booking.confirmed",
            "dev.vietnature.booking-service.booking.completed",
            "dev.vietnature.booking-service.booking.cancelled",
            "dev.vietnature.booking-service.booking.failed" 
        };

        public DashboardStatsConsumer(IServiceScopeFactory scopeFactory, ILogger<DashboardStatsConsumer> logger, IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {

            return Task.Run(async () =>
            {
                var config = new ConsumerConfig {
                    BootstrapServers = _configuration["Kafka:BootstrapServers"],
                    GroupId = "user-service-dashboard-group-v9",
                    AutoOffsetReset = AutoOffsetReset.Earliest,
                    EnableAutoCommit = true
                };

                using var consumer = new ConsumerBuilder<Ignore, string>(config).Build();
                consumer.Subscribe(_topics);

                _logger.LogInformation("🚀 DashboardStatsConsumer đang lắng nghe các sự kiện thống kê...");

                while (!stoppingToken.IsCancellationRequested)
                {
                    try {
                        var consumeResult = consumer.Consume(stoppingToken);
                        var topic = consumeResult.Topic;
                        var message = consumeResult.Message.Value;

                        using var scope = _scopeFactory.CreateScope();
                        var dbContext = scope.ServiceProvider.GetRequiredService<UserDbContext>();
                        var stats = await dbContext.DashboardStats.FirstOrDefaultAsync();
                        if (stats == null) {
                            stats = new DashboardStatsEntity { Id = 1 };
                            dbContext.DashboardStats.Add(stats);
                        }

                        if (topic == "dev.vietnature.tour-service.tour.created") 
                        {
                            var tourEvent = JsonSerializer.Deserialize<TourCreatedEvent>(message, new JsonSerializerOptions 
                            { 
                                PropertyNameCaseInsensitive = true 
                            });

                            if (tourEvent != null) 
                            {
                                _logger.LogInformation("📈 Đang xử lý tin nhắn Tour mới: {TourId}", tourEvent.TourId);
                                var distribution = string.IsNullOrEmpty(stats.RegionDistribution) 
                                    ? new Dictionary<string, int>() 
                                    : JsonSerializer.Deserialize<Dictionary<string, int>>(stats.RegionDistribution) ?? new();

                                string regionName = tourEvent.Region ?? "Không xác định";
                                
                                if (distribution.ContainsKey(regionName)) 
                                    distribution[regionName]++;
                                else 
                                    distribution[regionName] = 1;

                                stats.RegionDistribution = JsonSerializer.Serialize(distribution);

                                stats.TotalTours += 1; 

                                _logger.LogInformation("✅ Đã cập nhật thống kê cho vùng: {Region}. Tổng Tour: {Total}", regionName, stats.TotalTours);
                            }
                        }
                        else if (topic == "dev.vietnature.auth-service.user.created") 
                        {
                            var userEvent = JsonSerializer.Deserialize<UserCreatedEvent>(message, 
                                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (userEvent != null)
                            {
                                stats.TotalUsers += 1;
                                
                                _logger.LogInformation("👤 [Dashboard] Đã nhận User mới: {UserId}. Tổng User hiện tại: {Total}", 
                                    userEvent.UserId, stats.TotalUsers);
                            }
                        }
                        else if (topic == "dev.vietnature.booking-service.booking.requested")
                        {
                            var bookingEvent = JsonSerializer.Deserialize<BookingRequestedEvent>(message, 
                                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (bookingEvent != null)
                            {
                                var recentList = string.IsNullOrEmpty(stats.RecentBookings) 
                                    ? new List<RecentBookingDto>() 
                                    : JsonSerializer.Deserialize<List<RecentBookingDto>>(stats.RecentBookings) ?? new();

                                recentList.Insert(0, new RecentBookingDto {
                                    BookingId = bookingEvent.BookingId.ToString().Substring(0, 8).ToUpper(),
                                    CustomerName = bookingEvent.ContactFullName,
                                    TotalPrice = bookingEvent.TotalPrice,
                                    Status = "Pending",
                                    CreatedAt = DateTime.UtcNow
                                });

                                stats.RecentBookings = JsonSerializer.Serialize(recentList.Take(5).ToList());
                                _logger.LogInformation("🆕 [Dashboard] Đã ghi nhận đơn hàng mới từ: {Name}", bookingEvent.ContactFullName);
                            }
                        }

                        else if (topic == "dev.vietnature.booking-service.booking.confirmed") 
                        {
                            if (string.IsNullOrWhiteSpace(message)) 
                            {
                                _logger.LogWarning("⚠️ Nhận được tin nhắn Kafka trống (empty payload) tại topic: {Topic}", topic);
                                return; 
                            }
                            var bookingEvent = JsonSerializer.Deserialize<BookingConfirmedEvent>(message, 
                                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                                
                            if (bookingEvent != null)
                            {
                                stats.TotalBookings += 1;
                                stats.TotalRevenue += bookingEvent.TotalPrice;

                                // Update Payment Method Distribution
                                var paymentDistribution = string.IsNullOrEmpty(stats.PaymentMethodDistribution) 
                                    ? new Dictionary<string, int>() 
                                    : JsonSerializer.Deserialize<Dictionary<string, int>>(stats.PaymentMethodDistribution) ?? new();

                                string paymentMethod = string.IsNullOrEmpty(bookingEvent.PaymentMethod) ? "Unknown" : bookingEvent.PaymentMethod;
                                
                                if (paymentDistribution.ContainsKey(paymentMethod)) 
                                    paymentDistribution[paymentMethod]++;
                                else 
                                    paymentDistribution[paymentMethod] = 1;

                                stats.PaymentMethodDistribution = JsonSerializer.Serialize(paymentDistribution);
                                _logger.LogInformation("💳 [Dashboard] Cập nhật Payment Stats: {Method}", paymentMethod);

                                var recentJson = string.IsNullOrWhiteSpace(stats.RecentBookings) ? "[]" : stats.RecentBookings;
                                var recentList = JsonSerializer.Deserialize<List<RecentBookingDto>>(recentJson) ?? new();
                                var shortId = bookingEvent.BookingId.ToString().Substring(0, 8).ToUpper();
                                var targetBooking = recentList.FirstOrDefault(b => b.BookingId == shortId);
                                if (targetBooking != null)
                                {
                                    targetBooking.Status = "Confirmed";
                                    stats.RecentBookings = JsonSerializer.Serialize(recentList);
                                    _logger.LogInformation("✅ [Dashboard] Đơn #{Id} đã được xác nhận", shortId);
                                }

                                var topToursJson = string.IsNullOrWhiteSpace(stats.TopBookedTours) ? "[]" : stats.TopBookedTours;
                                var topBookedTours = JsonSerializer.Deserialize<List<TopTourDto>>(topToursJson) ?? new();

                                var existingTour = topBookedTours.FirstOrDefault(t => t.TourId == bookingEvent.TourId);
                                int newGuests = bookingEvent.ParticipantsCount;
                                if (existingTour != null)
                                {
                                    existingTour.BookedCount += newGuests;
                                    existingTour.TourName = bookingEvent.TourName;
                                    existingTour.TotalSlots = bookingEvent.TotalSlots;
                                }
                                else
                                {
                                    topBookedTours.Add(new TopTourDto
                                    {
                                        TourId = bookingEvent.TourId,
                                        TourName = bookingEvent.TourName,
                                        BookedCount = newGuests,
                                        TotalSlots = bookingEvent.TotalSlots
                                    });
                                }

                                var updatedTopTours = topBookedTours
                                    .OrderByDescending(t => t.BookedCount)
                                    .ThenBy(t => t.TourName)
                                    .Take(5)
                                    .ToList();

                                stats.TopBookedTours = JsonSerializer.Serialize(updatedTopTours);
                                _logger.LogInformation("💰 [Booking] +1 Đơn thành công. Doanh thu +{Price}", bookingEvent.TotalPrice);
                            }
                        }

                        else if (topic == "dev.vietnature.booking-service.booking.completed" || 
                                topic == "dev.vietnature.booking-service.booking.cancelled" || 
                                topic == "dev.vietnature.booking-service.booking.failed")
                        {
                            var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                            Guid bookingId = Guid.Empty;
                            string newStatusLabel = "";

                            if (topic.EndsWith("completed"))
                            {
                                var e = JsonSerializer.Deserialize<BookingCompletedEvent>(message, jsonOptions);
                                if (e != null) { bookingId = e.BookingId; newStatusLabel = "Completed"; }
                            }
                            else if (topic.EndsWith("cancelled"))
                            {
                                var e = JsonSerializer.Deserialize<BookingCancelledEvent>(message, jsonOptions);
                                if (e != null) { bookingId = e.BookingId; newStatusLabel = "Cancelled"; }
                            }
                            else if (topic.EndsWith("failed"))
                            {
                                var e = JsonSerializer.Deserialize<BookingFailedEvent>(message, jsonOptions);
                                if (e != null) { bookingId = e.BookingId; newStatusLabel = "Failed"; }
                            }

                            if (bookingId != Guid.Empty && !string.IsNullOrEmpty(stats.RecentBookings))
                            {
                                var recentList = JsonSerializer.Deserialize<List<RecentBookingDto>>(stats.RecentBookings) ?? new();
                                var shortId = bookingId.ToString().Substring(0, 8).ToUpper();
                                
                                var target = recentList.FirstOrDefault(b => b.BookingId == shortId);
                                if (target != null)
                                {
                                    var oldStatus = target.Status;
                                    target.Status = newStatusLabel;
                                    if (newStatusLabel == "Cancelled" && oldStatus == "Confirmed")
                                    {
                                        stats.TotalBookings = Math.Max(0, stats.TotalBookings - 1);
                                        stats.TotalRevenue = Math.Max(0, stats.TotalRevenue - target.TotalPrice);
                                        _logger.LogInformation("📉 [Dashboard] Đơn #{Id} bị Hủy. Đã trừ doanh thu.", shortId);
                                    }

                                    stats.RecentBookings = JsonSerializer.Serialize(recentList);
                                    _logger.LogInformation("🔄 [Dashboard] Cập nhật đơn #{Id} sang trạng thái: {Status}", shortId, newStatusLabel);
                                }
                            }
                        }

                        stats.LastUpdated = DateTime.UtcNow;
                        await dbContext.SaveChangesAsync();
                    }
                    catch (Exception ex) {
                        _logger.LogError(ex, "Lỗi xử lý tin nhắn Kafka trong DashboardStatusConsumer");
                    }
                }
                consumer.Close();
            }, stoppingToken);
        }
    }
}