using Microsoft.EntityFrameworkCore;
using BookingService.Entities;

namespace BookingService.Data
{
  public class BookingDbContext : DbContext
  {
    public BookingDbContext(DbContextOptions<BookingDbContext> options)
      : base(options)
    {
    }

    public DbSet<BookingEntity> Bookings { get; set; }
    public DbSet<BookingDetailEntity> BookingDetails { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);
      modelBuilder.Entity<BookingEntity>()
          .Property(b => b.Status)
          .HasConversion<string>();

      modelBuilder.Entity<BookingDetailEntity>()
          .Property(bd => bd.ParticipantType)
          .HasConversion<string>();

      modelBuilder.Entity<BookingEntity>()
          .HasMany(b => b.BookingDetails)
          .WithOne(d => d.Booking)
          .HasForeignKey(d => d.BookingId)
          .OnDelete(DeleteBehavior.Cascade);
    }
  }
}