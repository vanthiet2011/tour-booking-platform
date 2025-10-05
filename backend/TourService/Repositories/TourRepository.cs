// Trong thư mục Repositories/TourRepository.cs
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

        public async Task<IEnumerable<TourEntity>> GetAllAsync()
        {
            // Lấy tour kèm theo thông tin các điểm đến
            return await _context.Tours
                .Include(t => t.TourDestinations)
                .ThenInclude(td => td.Destination)
                .ToListAsync();
        }

        public async Task<TourEntity?> GetByIdAsync(Guid id)
        {
            // Lấy chi tiết tour, bao gồm cả điểm đến và lịch trình
            return await _context.Tours
                .Include(t => t.TourDestinations)
                .ThenInclude(td => td.Destination)
                .Include(t => t.TourSchedules)
                .FirstOrDefaultAsync(t => t.TourId == id);
        }

        public async Task CreateAsync(TourEntity tour)
        {
            await _context.Tours.AddAsync(tour);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(TourEntity tour)
        {
            // Cần xử lý logic xóa các TourDestinations cũ và thêm mới
            var existingDestinations = _context.TourDestinations.Where(td => td.TourId == tour.TourId);
            _context.TourDestinations.RemoveRange(existingDestinations);

            // Thêm lại các destinations mới
            await _context.TourDestinations.AddRangeAsync(tour.TourDestinations);

            _context.Tours.Update(tour);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var tour = await GetByIdAsync(id);
            if (tour != null)
            {
                _context.Tours.Remove(tour);
                await _context.SaveChangesAsync();
            }
        }
    }
}