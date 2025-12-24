namespace TourService.Constants
{
    public static class CacheKeys
    {
        // CATEGORY KEYS
        public const string CategoryList = "cats:all";
        public static string GetCategoryByIdKey(Guid id) => $"cats:obj:{id}";

        // DESTINATION KEYS 
        public const string DestListPrefix = "dest:list";
        public const string DestPopular = "dest:popular";
        
        public static string GetDestByIdKey(Guid id) => $"dest:obj:{id}";
        
        public static string GetDestListKey(Guid? catId, string? reg, string? search, int page, int size)
        {
            return $"{DestListPrefix}:" +
                   $"{catId?.ToString() ?? "all"}:" +
                   $"{reg ?? "all"}:" +
                   $"{search ?? "all"}:" +
                   $"{page}:{size}";
        }

        // TOUR KEYS 
        public const string TourListPrefix = "tours:list";
        
        public static string GetTourByIdKey(Guid id) => $"tours:obj:{id}";
        
        public static string GetTourListKey(
            int page, int pageSize, string? search, 
            decimal? minPrice, decimal? maxPrice, 
            int? minDays, int? maxDays, 
            string? region, Guid? destId)
        {
            return $"{TourListPrefix}:p{page}:s{pageSize}:" +
                   $"{search ?? "all"}:" +
                   $"{minPrice?.ToString() ?? "any"}:{maxPrice?.ToString() ?? "any"}:" +
                   $"{minDays?.ToString() ?? "any"}:{maxDays?.ToString() ?? "any"}:" +
                   $"{region ?? "all"}:" +
                   $"{destId?.ToString() ?? "all"}";
        }
    }
}