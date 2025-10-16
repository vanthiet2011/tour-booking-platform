using Microsoft.EntityFrameworkCore;
using TourService.Data;
using TourService.Entities;

namespace TourService.Repositories;

public class TourDepartureRepository : ITourDepartureRepository
{
    private readonly TourDbContext _context;

    public TourDepartureRepository(TourDbContext context)
    {
        _context = context;
    }

    public async Task<TourDepartureEntity?> GetByIdWithTourAsync(Guid id)
    {
      return await _context.TourDepartures
          .Include(td => td.Tour)
          .FirstOrDefaultAsync(td => td.Id == id);
    }
    public async Task<IEnumerable<TourDepartureEntity>> GetByTourIdAsync(Guid tourId)
    {
      return await _context.TourDepartures
          .Where(td => td.TourId == tourId && td.StartDate >= DateTime.UtcNow && td.AvailableSlots > 0)
          .OrderBy(td => td.StartDate)
          .ToListAsync();
    }
}