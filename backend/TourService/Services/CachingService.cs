using System.Text.Json;
using StackExchange.Redis;
using TourService.Constants;

namespace TourService.Services
{
    public class CachingService : ICachingService
    {
        private readonly IDatabase _db;
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<CachingService> _logger;

        public CachingService(IConnectionMultiplexer multiplexer, ILogger<CachingService> logger)
        {
            _redis = multiplexer;
            _db = multiplexer.GetDatabase();
            _logger = logger;
        }

        public async Task<T?> GetAsync<T>(string key) where T : class
        {
            try {
                var redisValue = await _db.StringGetAsync(key);
                return redisValue.IsNullOrEmpty ? null : JsonSerializer.Deserialize<T>(redisValue!);
            } catch (Exception ex) {
                _logger.LogError(ex, "Redis Get Error. Key: {Key}", key);
                return null;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var serializedValue = JsonSerializer.Serialize(value);
            await _db.StringSetAsync(key, serializedValue, expiry);
        }

        public async Task RemoveAsync(string key) => await _db.KeyDeleteAsync(key);

        public async Task RemoveByPrefixAsync(string prefix)
        {
            var server = _redis.GetServer(_redis.GetEndPoints()[0]);
            var keys = server.Keys(pattern: prefix + "*").ToArray();
            if (keys.Length > 0) {
                await _db.KeyDeleteAsync(keys);
                _logger.LogInformation("Removed {Count} keys with prefix: {Prefix}", keys.Length, prefix);
            }
        }

        
        public async Task InvalidateTourCacheAsync(Guid? tourId = null)
        {
            await RemoveByPrefixAsync(CacheKeys.TourListPrefix);
            if (tourId.HasValue)
                await RemoveAsync(CacheKeys.GetTourByIdKey(tourId.Value));
        }

        public async Task InvalidateDestinationCacheAsync(Guid? destId = null)
        {
            await RemoveAsync(CacheKeys.DestPopular);
            await RemoveByPrefixAsync(CacheKeys.DestListPrefix);
            if (destId.HasValue)
                await RemoveAsync(CacheKeys.GetDestByIdKey(destId.Value));
        }

        public async Task InvalidateCategoryCacheAsync(Guid? catId = null)
        {
            await RemoveAsync(CacheKeys.CategoryList);
            if (catId.HasValue)
                await RemoveAsync(CacheKeys.GetCategoryByIdKey(catId.Value));
        }
    }
}