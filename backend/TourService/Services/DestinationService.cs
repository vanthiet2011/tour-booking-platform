using System.Text.Json;
using StackExchange.Redis;
using TourService.Entities;
using TourService.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TourService.Dtos;
using AutoMapper;
using TourService.Constants;

namespace TourService.Services
{
    public class DestinationService : IDestinationService
    {
        private readonly IDestinationRepository _destinationRepository;
        private readonly ICachingService _cachingService;
        private readonly IMapper _mapper;

        public DestinationService(
            IDestinationRepository destinationRepository,
            ICachingService cachingService,
            IMapper mapper,
            ILogger<DestinationService> logger)
        {
            _destinationRepository = destinationRepository;
            _cachingService = cachingService;
            _mapper = mapper;
        }

        public async Task<PaginatedResponseDto<DestinationResponseDto>> GetAllDestinationsAsync(
            Guid? categoryId, 
            string? region, 
            string? search, 
            PaginationParams paginationParams)
        {
            string cacheKey = CacheKeys.GetDestListKey(
                categoryId,
                region,
                search,
                paginationParams.Page,
                paginationParams.PageSize
            );
            var cached = await _cachingService.GetAsync<PaginatedResponseDto<DestinationResponseDto>>(cacheKey);
            if (cached != null) return cached;

            var (items, totalCount) = await _destinationRepository.GetAllPaginatedAsync(
                categoryId,
                region,
                search,
                paginationParams.Page,
                paginationParams.PageSize
            );
            var dtos = _mapper.Map<IEnumerable<DestinationResponseDto>>(items);
            var result = new PaginatedResponseDto<DestinationResponseDto>(
                paginationParams.Page, paginationParams.PageSize, totalCount, dtos
            );

            await _cachingService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));
            return result;
        }

        public async Task<DestinationResponseDto?> GetDestinationByIdAsync(Guid id)
        {
            string cacheKey = CacheKeys.GetDestByIdKey(id);

            var cached = await _cachingService.GetAsync<DestinationResponseDto>(cacheKey);
            if (cached != null) return cached;

            var entity = await _destinationRepository.GetByIdAsync(id);
            if (entity == null) return null;

            var dto = _mapper.Map<DestinationResponseDto>(entity);
            await _cachingService.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(30));
            return dto;
        }

        public async Task<IEnumerable<DestinationResponseDto>> GetPopularDestinationsAsync(int count)
        {
            var cached = await _cachingService.GetAsync<IEnumerable<DestinationResponseDto>>(CacheKeys.DestPopular);
            if (cached != null) return cached;

            var entities = await _destinationRepository.GetPopularAsync(count);
            var dtos = _mapper.Map<IEnumerable<DestinationResponseDto>>(entities);

            await _cachingService.SetAsync(CacheKeys.DestPopular, dtos, TimeSpan.FromHours(1));
            return dtos;
        }

        public async Task<DestinationResponseDto> CreateDestinationAsync(DestinationEntity destination, List<Guid> categoryIds)
        {
            var createdEntity = await _destinationRepository.CreateAsync(destination, categoryIds);
            await _cachingService.InvalidateDestinationCacheAsync();
            return _mapper.Map<DestinationResponseDto>(createdEntity);
        }

        public async Task UpdateDestinationAsync(DestinationEntity destination, List<Guid> categoryIds)
        {
            await _destinationRepository.UpdateAsync(destination, categoryIds);
            await _cachingService.InvalidateDestinationCacheAsync(destination.Id);
        }

        public async Task DeleteDestinationAsync(Guid id)
        {
            await _destinationRepository.DeleteAsync(id);
            await _cachingService.InvalidateDestinationCacheAsync(id);
        }
    }
}