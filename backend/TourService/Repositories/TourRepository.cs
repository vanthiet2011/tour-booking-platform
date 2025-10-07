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
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<TourEntity?> GetByIdAsync(Guid id)
        {
            return await _context.Tours
                .Include(t => t.TourDestinations).ThenInclude(td => td.Destination)
                .Include(t => t.TourSchedules)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<TourEntity> UpdateAsync(TourEntity tour)
        {
            _context.Tours.Update(tour);
            await _context.SaveChangesAsync();
            return tour;
        }
    }
}