using Microsoft.EntityFrameworkCore;
using TourService.Entities;

namespace TourService.Data
{
  public class TourDbContext : DbContext
  {
    public TourDbContext(DbContextOptions<TourDbContext> options)
      : base(options)
    {
    }

    public DbSet<TourEntity> Tours { get; set; }
    public DbSet<TourScheduleEntity> TourSchedules { get; set; }
    public DbSet<ReviewEntity> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);
      //Cấu hình mối quan hệ giữa Tour và TourSchedule
      modelBuilder.Entity<TourEntity>().HasMany(t => t.Schedules)
        .WithOne(s => s.Tour)
        .HasForeignKey(s => s.TourId)
        .OnDelete(DeleteBehavior.Cascade);
      // Cấu hình mối quan hệ giữa Tour và Review
      modelBuilder.Entity<TourEntity>().HasMany(t => t.Reviews)
        .WithOne(r => r.Tour)
        .HasForeignKey(r => r.TourId)
        .OnDelete(DeleteBehavior.Cascade);
    }
  }
}