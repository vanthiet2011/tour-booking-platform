using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using TourService.Data;
using TourService.Entities;
using TourService.Models;

namespace TourService.Repositories
{
    public class TourRepository : ITourRepository
    {
        private readonly TourDbContext _context;

        public TourRepository(TourDbContext context)
        {
            _context = context;
        }

        public async Task<TourEntity> CreateAsync(TourEntity tour)
        {
            await _context.Tours.AddAsync(tour);
            await _context.SaveChangesAsync();
            return tour;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var tourToDelete = await _context.Tours.FindAsync(id);
            if (tourToDelete == null) return false;
            _context.Tours.Remove(tourToDelete);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PaginatedResponse<TourEntity>> GetAllAsync(
            int page, 
            int pageSize, 
            string? search = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int ? minDurationDays = null,
            int ? maxDurationDays = null,
            string? region = null,
            Guid? destinationId = null)
        {
            var query = _context.Tours
                .Include(t => t.TourDestinations).ThenInclude(td => td.Destination)
                .Include(t => t.TourDepartures)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchPattern = $"%{search.Trim()}%";

                query = query.Where(t =>
                    EF.Functions.ILike(t.Name!, searchPattern) ||
                    t.TourDestinations.Any(td =>
                        EF.Functions.ILike(td.Destination!.Name!, searchPattern)
                    )
                );
            }

            if (minPrice.HasValue)
            {
                query = query.Where(t => t.PricePerAdult >= minPrice.Value);
            }
            
            if (maxPrice.HasValue)
            {
                query = query.Where(t => t.PricePerAdult <= maxPrice.Value);
            }

            if (minDurationDays.HasValue || maxDurationDays.HasValue)
            {
                int minDays = minDurationDays ?? 1;
                int maxDays = maxDurationDays ?? 30; 

                var numbers = Enumerable.Range(minDays, maxDays - minDays + 1)
                    .Select(n => n.ToString())
                    .ToList();

                query = query.Where(t =>
                    !string.IsNullOrEmpty(t.Duration) &&
                    numbers.Any(num => t.Duration.StartsWith(num))
                );
            }

            if (!string.IsNullOrWhiteSpace(region))
            {
                string dbRegionValue = "";
                switch (region.ToLower())
                {
                    case "north": dbRegionValue = "Miền Bắc"; break;
                    case "central": dbRegionValue = "Miền Trung"; break;
                    case "south": dbRegionValue = "Miền Nam"; break;
                }

                if (!string.IsNullOrEmpty(dbRegionValue))
                {
                    query = query.Where(t => t.TourDestinations.Any(td => 
                        td.Destination!.Region == dbRegionValue));
                }
            }

            if (destinationId.HasValue)
            {
                query = query.Where(t => t.TourDestinations.Any(td => td.DestinationId == destinationId.Value));
            }

            query = query.OrderByDescending(t => t.CreatedAt);

            int totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            return new PaginatedResponse<TourEntity>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
        }


        public async Task<TourEntity?> GetByIdAsync(Guid id)
        {
            return await _context.Tours
                .Include(t => t.TourDestinations).ThenInclude(td => td.Destination)
                .Include(t => t.TourSchedules)
                .Include(t => t.TourDepartures)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<TourEntity>> GetByDestinationIdAsync(Guid destinationId)
        {
            return await _context.Tours
                .Where(t => t.TourDestinations.Any(td => td.DestinationId == destinationId))
                .Include(t => t.TourDestinations).ThenInclude(td => td.Destination)
                .Include(t => t.TourSchedules)
                .Include(t => t.TourDepartures)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<TourEntity> UpdateAsync(TourEntity tourWithNewData)
        {
            var existingTour = await _context.Tours
                .Include(t => t.TourSchedules)
                .Include(t => t.TourDestinations)
                .Include(t => t.TourDepartures)
                .FirstOrDefaultAsync(t => t.Id == tourWithNewData.Id);

            if (existingTour == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy tour để cập nhật với ID: {tourWithNewData.Id}");
            }

            _context.Entry(existingTour).CurrentValues.SetValues(tourWithNewData);
            _context.Entry(existingTour).Property(x => x.CreatedAt).IsModified = false;

            existingTour.Highlights = tourWithNewData.Highlights;
            existingTour.GalleryImages = tourWithNewData.GalleryImages;
            existingTour.Inclusions = tourWithNewData.Inclusions;

            _context.TourSchedules.RemoveRange(existingTour.TourSchedules);
            _context.TourDestinations.RemoveRange(existingTour.TourDestinations);
            _context.TourDepartures.RemoveRange(existingTour.TourDepartures);

            existingTour.TourSchedules = tourWithNewData.TourSchedules.Select(s => new TourScheduleEntity
            {
                DayNumber = s.DayNumber,
                Title = s.Title,
                Description = s.Description,
                Tour = existingTour
            }).ToList();

            existingTour.TourDestinations = tourWithNewData.TourDestinations.Select(d => new TourDestinationEntity
            {
                DestinationId = d.DestinationId,
                Tour = existingTour
            }).ToList();

            existingTour.TourDepartures = tourWithNewData.TourDepartures.Select(d => new TourDepartureEntity
            {
                StartDate = d.StartDate,
                EndDate = d.EndDate,
                AvailableSlots = d.AvailableSlots,
                Tour = existingTour
            }).ToList();
            await _context.SaveChangesAsync();
            
            return existingTour;
        }
    }
}