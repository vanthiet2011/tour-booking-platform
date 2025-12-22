// File: TourService/Services/IDestinationService.cs (TẠO MỚI)
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TourService.Dtos;
using TourService.Entities;

namespace TourService.Services
{
    public interface IDestinationService
    {
        Task<PaginatedResponseDto<DestinationResponseDto>> GetAllDestinationsAsync(
            Guid? categoryId, 
            string? region, 
            string? search, 
            PaginationParams paginationParams
        );
        Task<DestinationResponseDto?> GetDestinationByIdAsync(Guid id);
        Task<IEnumerable<DestinationResponseDto>> GetPopularDestinationsAsync(int count);
        Task<DestinationResponseDto> CreateDestinationAsync(DestinationEntity destination, List<Guid> categoryIds);
        Task UpdateDestinationAsync(DestinationEntity destination, List<Guid> categoryIds);
        Task DeleteDestinationAsync(Guid id);
    }
}