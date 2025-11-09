using Microsoft.EntityFrameworkCore;
using TourService.Entities;

namespace TourService.Data
{
    public class TourDbContext : DbContext
    {
        public DbSet<DestinationEntity> Destinations { get; set; }
        public DbSet<CategoryEntity> Categories { get; set; }
        public DbSet<DestinationCategoryEntity> DestinationCategories { get; set; }
        public DbSet<TourEntity> Tours { get; set; }
        public DbSet<TourDestinationEntity> TourDestinations { get; set; }
        public DbSet<TourScheduleEntity> TourSchedules { get; set; }
        public DbSet<ReviewEntity> Reviews { get; set; }
        public DbSet<TourDepartureEntity> TourDepartures { get; set; }

        // ✅ Constructor chính
        public TourDbContext(DbContextOptions<TourDbContext> options)
            : base(options)
        {
        }

        // ✅ Constructor mặc định để EF dùng khi migrate
        public TourDbContext()
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseNpgsql("Host=localhost;Port=5434;Database=TourDb;Username=your_user;Password=your_password");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TourDestinationEntity>()
                .HasKey(td => new { td.TourId, td.DestinationId });

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

            modelBuilder.Entity<TourEntity>()
                .HasMany(t => t.TourSchedules)
                .WithOne(ts => ts.Tour)
                .HasForeignKey(ts => ts.TourId)
                .OnDelete(DeleteBehavior.Cascade);

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

            modelBuilder.Entity<DestinationCategoryEntity>()
                .HasKey(dc => new { dc.DestinationId, dc.CategoryId });

            modelBuilder.Entity<DestinationCategoryEntity>()
                .HasOne(dc => dc.Destination)
                .WithMany(d => d.DestinationCategories)
                .HasForeignKey(dc => dc.DestinationId);

            modelBuilder.Entity<DestinationCategoryEntity>()
                .HasOne(dc => dc.Category)
                .WithMany(c => c.DestinationCategories)
                .HasForeignKey(dc => dc.CategoryId);
        }
    }
}