using Microsoft.EntityFrameworkCore;
using PaymentService.Entities;

namespace PaymentService.Data
{
    public class PaymentDbContext : DbContext
    {
        public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
        {
        }
        public DbSet<PaymentEnity> Payments { get; set; }
    }
}