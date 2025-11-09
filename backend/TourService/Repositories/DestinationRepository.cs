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

        public async Task<IEnumerable<DestinationEntity>> GetAllAsync(Guid? categoryId)
        {
            var query = _context.Destinations
                                .Include(d => d.DestinationCategories)
                                .ThenInclude(dc => dc.Category)
                                .AsQueryable();
            if (categoryId.HasValue && categoryId.Value != Guid.Empty)
            {
                var cid = categoryId.Value;
                query = query.Where(d => d.DestinationCategories.Any(c => c.CategoryId == cid));
            }
            query = query.OrderByDescending(d => d.CreatedAt);
            return await query.ToListAsync();
        }

        public async Task<(IEnumerable<DestinationEntity> Items, int TotalCount)> GetAllPaginatedAsync(
            Guid? categoryId, 
            string? region, 
            string? search, 
            int page, 
            int pageSize)
        {
            var query = _context.Destinations
                .Include(d => d.DestinationCategories)
                .ThenInclude(dc => dc.Category)
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(d => d.DestinationCategories.Any(c => c.CategoryId == categoryId.Value));

            if (!string.IsNullOrEmpty(region))
                query = query.Where(d => d.Region == region);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(d => d.Name!.Contains(search) || d.Description!.Contains(search));

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(d => d.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<IEnumerable<DestinationEntity>> GetPopularFromDbAsync(int count)
        {
             return await _context.Destinations
                .Include(d => d.DestinationCategories)
                .ThenInclude(dc => dc.Category)
                .Where(d => d.IsPopular)
                .OrderByDescending(d => d.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<DestinationEntity?> GetByIdAsync(Guid? id)
        {
            return await _context.Destinations
                .Include(d => d.DestinationCategories)
                .ThenInclude(dc => dc.Category)
                .FirstOrDefaultAsync(d => d.Id == id);
        }
        public async Task<DestinationEntity> CreateAsync(DestinationEntity destination, List<Guid> categoryIds)
        {
            destination.Id = Guid.NewGuid(); 
            if (categoryIds != null)
            {
                foreach (var catId in categoryIds)
                {
                    destination.DestinationCategories.Add(new DestinationCategoryEntity
                    {
                        DestinationId = destination.Id,
                        CategoryId = catId
                    });
                }
            }
            await _context.Destinations.AddAsync(destination);
            await _context.SaveChangesAsync();
            return destination;
        }

        public async Task UpdateAsync(DestinationEntity destination, List<Guid> categoryIds)
        {
            var existingEntity = await _context.Destinations
                .Include(d => d.DestinationCategories)
                .FirstOrDefaultAsync(d => d.Id == destination.Id);

            if (existingEntity == null) return; 

            _context.Entry(existingEntity).CurrentValues.SetValues(destination);
            existingEntity.DestinationCategories.Clear();

            if (categoryIds != null)
            {
                foreach (var catId in categoryIds)
                {
                    existingEntity.DestinationCategories.Add(new DestinationCategoryEntity
                    {
                        DestinationId = existingEntity.Id,
                        CategoryId = catId
                    });
                }
            }
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(Guid id)
        {
            var destination = await _context.Destinations.FindAsync(id); 
            if (destination != null)
            {
                _context.Destinations.Remove(destination);
                await _context.SaveChangesAsync();
            }
        }
    }
}