using Microsoft.EntityFrameworkCore;
using TourService.Data;
using TourService.Entities;

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

        public async Task<IEnumerable<TourEntity>> GetAllAsync()
        {
            return await _context.Tours
                .Include(t => t.TourDestinations).ThenInclude(td => td.Destination)
                .Include(t => t.TourSchedules)
                .Include(t => t.TourDepartures)
                .AsNoTracking()
                .ToListAsync();
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