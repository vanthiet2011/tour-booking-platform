using Microsoft.EntityFrameworkCore;
using TourService.Entities;

namespace TourService.Data
{
  public class TourDbContext : DbContext
  {
    public DbSet<DestinationEntity> Destinations { get; set; }
    public DbSet<TourEntity> Tours { get; set; }
    public DbSet<TourDestinationEntity> TourDestinations { get; set; }
    public DbSet<TourScheduleEntity> TourSchedules { get; set; }
    public DbSet<ReviewEntity> Reviews { get; set; }
    public DbSet<TourDepartureEntity> TourDepartures { get; set; }

    public TourDbContext(DbContextOptions<TourDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // Configure the composite primary key for the join table
      modelBuilder.Entity<TourDestinationEntity>()
          .HasKey(td => new { td.TourId, td.DestinationId });

      // Configure the many-to-many relationship between Tour and Destination
      modelBuilder.Entity<TourDestinationEntity>()
          .HasOne(td => td.Tour)
          .WithMany(t => t.TourDestinations)
          .HasForeignKey(td => td.TourId)
          .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<TourDestinationEntity>()
          .HasOne(td => td.Destination)
          .WithMany(d => d.TourDestinations)
          .HasForeignKey(td => td.DestinationId)
          .OnDelete(DeleteBehavior.Cascade);
      // Configure the one-to-many relationship between Tour and TourSchedule
      modelBuilder.Entity<TourEntity>()
          .HasMany(t => t.TourSchedules)
          .WithOne(ts => ts.Tour)
          .HasForeignKey(ts => ts.TourId)
          .OnDelete(DeleteBehavior.Cascade);
      // Cấu hình mối quan hệ một-nhiều giữa Tour và Review
      modelBuilder.Entity<TourEntity>()
          .HasMany(t => t.Reviews)
          .WithOne(r => r.Tour)
          .HasForeignKey(r => r.TourId)
          .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<TourEntity>()
          .HasMany(t => t.TourDepartures)
          .WithOne(td => td.Tour)
          .HasForeignKey(td => td.TourId)
          .OnDelete(DeleteBehavior.Cascade);
      
      modelBuilder.Entity<TourEntity>()
          .Property(t => t.Highlights)
          .HasColumnType("jsonb");

      modelBuilder.Entity<TourEntity>()
          .Property(t => t.GalleryImages)
          .HasColumnType("jsonb");

      modelBuilder.Entity<TourEntity>()
          .Property(t => t.Inclusions)
          .HasColumnType("jsonb");
    }
  }
}