using System.Text.Json;
using StackExchange.Redis;

namespace TourService.Services
{
    public class CachingService : ICachingService
    {
        private readonly IDatabase _db;

        public CachingService(IConnectionMultiplexer multiplexer)
        {
            _db = multiplexer.GetDatabase();
        }

        public async Task<T?> GetAsync<T>(string key) where T : class
        {
            var redisValue = await _db.StringGetAsync(key);
            if (redisValue.IsNullOrEmpty)
            {
                return null;
            }
            return JsonSerializer.Deserialize<T>(redisValue!);
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var serializedValue = JsonSerializer.Serialize(value);
            await _db.StringSetAsync(key, serializedValue, expiry);
        }

        public async Task RemoveAsync(string key)
        {
            await _db.KeyDeleteAsync(key);
        }
    }
}