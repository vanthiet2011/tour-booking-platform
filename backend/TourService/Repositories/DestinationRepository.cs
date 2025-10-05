using Microsoft.EntityFrameworkCore;
using TourService.Data;
using TourService.Entities;

namespace TourService.Repositories
{
    public class DestinationRepository : IDestinationRepository
    {
        private readonly TourDbContext _context;

        public DestinationRepository(TourDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DestinationEntity>> GetAllAsync()
        {
            return await _context.Destinations.ToListAsync();
        }

        public async Task<DestinationEntity?> GetByIdAsync(Guid id)
        {
            return await _context.Destinations.FindAsync(id);
        }

        public async Task CreateAsync(DestinationEntity destination)
        {
            await _context.Destinations.AddAsync(destination);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(DestinationEntity destination)
        {
            _context.Destinations.Update(destination);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var destination = await GetByIdAsync(id);
            if (destination != null)
            {
                _context.Destinations.Remove(destination);
                await _context.SaveChangesAsync();
            }
        }
    }
}