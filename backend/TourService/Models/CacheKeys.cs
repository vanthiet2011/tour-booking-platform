// TourService/Models/CacheKeys.cs
namespace TourService.Models
{
    public static class CacheKeys
    {
        // Prefix chung cho tất cả cache liên quan đến Tour
        public const string TourPrefix = "tours";
        
        // Key cho danh sách tour theo trang
        // {0} = page, {1} = pageSize
        public const string ToursByPage = "tours:page:{0}:size:{1}";

        // Key cho chi tiết một tour
        // {0} = id
        public const string TourById = "tours:{0}";
    }
}