namespace BookingService.Dtos
{
    public class PaginatedResponseDto<T> where T : class
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public IEnumerable<T> Items { get; set; }

        public PaginatedResponseDto(int page, int pageSize, int totalCount, IEnumerable<T> items)
        {
            Page = page;
            PageSize = pageSize;
            TotalCount = totalCount;
            Items = items;
        }
    }
}