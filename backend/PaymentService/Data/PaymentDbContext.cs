using Microsoft.EntityFrameworkCore;
using PaymentService.Entities;
using PaymentService.Enums; // <-- Thêm Enum

namespace PaymentService.Data
{
    public class PaymentDbContext : DbContext
    {
        public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
        {
        }

        public DbSet<PaymentEntity> Payments { get; set; } // <-- Đảm bảo DbSet tồn tại

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PaymentEntity>()
                .Property(p => p.Status)
                .HasConversion<string>();

            modelBuilder.Entity<PaymentEntity>()
                .HasIndex(p => p.BookingId);

            modelBuilder.Entity<PaymentEntity>()
                .HasIndex(p => p.PaymentIntentId)
                .IsUnique();

            modelBuilder.Entity<PaymentEntity>()
                .HasIndex(p => p.PaymentGatewayTransactionId)
                .IsUnique();
        }
    }
}