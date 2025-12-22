namespace TourService.Services
{
    public interface ICachingService
    {
        Task<T?> GetAsync<T>(string key) where T : class;
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
        Task RemoveAsync(string key);
        Task RemoveByPrefixAsync(string prefix);
        Task InvalidateTourCacheAsync(Guid? tourId = null);
        Task InvalidateDestinationCacheAsync(Guid? destId = null);
    }
}