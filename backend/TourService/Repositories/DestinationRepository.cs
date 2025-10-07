using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using TourService.Data;
using TourService.Entities;

namespace TourService.Repositories
{
    public class DestinationRepository : IDestinationRepository
    {
        private readonly TourDbContext _context;
        private readonly IDatabase _redisDb;
        private const string PopularDestinationsCacheKey = "popular_destinations";

        public DestinationRepository(TourDbContext context, IConnectionMultiplexer redis)
        {
            _context = context;
            _redisDb = redis.GetDatabase();
        }

        public async Task<IEnumerable<DestinationEntity>> GetAllAsync()
        {
            return await _context.Destinations.ToListAsync();
        }

        public async Task<IEnumerable<DestinationEntity>> GetPopularAsync(int count)
        {
            var cachedDestinations = await _redisDb.StringGetAsync(PopularDestinationsCacheKey);
            if(!cachedDestinations.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<IEnumerable<DestinationEntity>>(cachedDestinations.ToString())!;
            }
            var destinationsFromDb = await _context.Destinations
                                 .Where(d => d.IsPopular)
                                 .OrderByDescending(d => d.CreatedAt)
                                 .Take(count)
                                 .ToListAsync();
            await _redisDb.StringSetAsync(PopularDestinationsCacheKey, JsonSerializer.Serialize(destinationsFromDb), TimeSpan.FromMinutes(10));
            return destinationsFromDb;
        }

        public async Task<DestinationEntity?> GetByIdAsync(Guid id)
        {
            return await _context.Destinations.FindAsync(id);
        }

        public async Task CreateAsync(DestinationEntity destination)
        {
            await _context.Destinations.AddAsync(destination);
            await _context.SaveChangesAsync();
            await _redisDb.KeyDeleteAsync(PopularDestinationsCacheKey);
        }

        public async Task UpdateAsync(DestinationEntity destination)
        {
            _context.Destinations.Update(destination);
            await _context.SaveChangesAsync();
            await _redisDb.KeyDeleteAsync(PopularDestinationsCacheKey);
        }

        public async Task DeleteAsync(Guid id)
        {
            var destination = await GetByIdAsync(id);
            if (destination != null)
            {
                _context.Destinations.Remove(destination);
                await _context.SaveChangesAsync();
                await _redisDb.KeyDeleteAsync(PopularDestinationsCacheKey);
            }
        }
    }
}