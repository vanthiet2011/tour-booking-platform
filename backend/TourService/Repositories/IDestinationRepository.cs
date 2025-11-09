// File: TourService/Repositories/IDestinationRepository.cs (CẬP NHẬT)
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TourService.Entities;

namespace TourService.Repositories
{
    public interface IDestinationRepository
    {
        Task<IEnumerable<DestinationEntity>> GetAllAsync(Guid? categoryId);
        Task<(IEnumerable<DestinationEntity> Items, int TotalCount)> GetAllPaginatedAsync(
            Guid? categoryId, 
            string? region, 
            string? search,
            int page, 
            int pageSize
        );
        Task<DestinationEntity?> GetByIdAsync(Guid? id);
        Task<IEnumerable<DestinationEntity>> GetPopularAsync(int count);

        Task<DestinationEntity> CreateAsync(DestinationEntity destination, List<Guid> categoryIds);
        Task UpdateAsync(DestinationEntity destination, List<Guid> categoryIds);
        Task DeleteAsync(Guid id);
    }
}