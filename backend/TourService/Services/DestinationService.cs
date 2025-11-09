// File: TourService/Services/DestinationService.cs (TẠO MỚI)
using System.Text.Json;
using StackExchange.Redis;
using TourService.Entities;
using TourService.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TourService.Dtos;
using AutoMapper;

namespace TourService.Services
{
    public class DestinationService : IDestinationService
    {
        private readonly IDestinationRepository _destinationRepository;
        private readonly IDatabase _redisDb;
        private readonly IMapper _mapper;
        private const string PopularDestinationsCacheKey = "popular_destinations";

        public DestinationService(
            IDestinationRepository destinationRepository,
            IConnectionMultiplexer redis,
            IMapper mapper)
        {
            _destinationRepository = destinationRepository;
            _redisDb = redis.GetDatabase();
            _mapper = mapper;
        }

        public async Task<PaginatedResponseDto<DestinationResponseDto>> GetAllDestinationsAsync(
            Guid? categoryId, 
            string? region, 
            string? search, 
            PaginationParams paginationParams)
        {
            var (items, totalCount) = await _destinationRepository.GetAllPaginatedAsync(
                categoryId,
                region,
                search,
                paginationParams.Page,
                paginationParams.PageSize
            );
            var dtos = _mapper.Map<IEnumerable<DestinationResponseDto>>(items);
            return new PaginatedResponseDto<DestinationResponseDto>(
                paginationParams.Page, 
                paginationParams.PageSize, 
                totalCount, 
                dtos
            );
        }

        public async Task<DestinationEntity?> GetDestinationByIdAsync(Guid id)
        {
            return await _destinationRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<DestinationResponseDto>> GetPopularDestinationsAsync(int count)
        {
            var cachedDestinations = await _redisDb.StringGetAsync(PopularDestinationsCacheKey);
            
            if(!cachedDestinations.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<IEnumerable<DestinationResponseDto>>(cachedDestinations.ToString())!;
            }

            var entitiesFromDb = await _destinationRepository.GetPopularFromDbAsync(count);
            var dtos = _mapper.Map<IEnumerable<DestinationResponseDto>>(entitiesFromDb);
            
            await _redisDb.StringSetAsync(
                PopularDestinationsCacheKey, 
                JsonSerializer.Serialize(dtos), 
                TimeSpan.FromMinutes(10)
            );
            
            return dtos;
        }

        public async Task<DestinationEntity> CreateDestinationAsync(DestinationEntity destination, List<Guid> categoryIds)
        {
            var createdEntity = await _destinationRepository.CreateAsync(destination, categoryIds);
            await _redisDb.KeyDeleteAsync(PopularDestinationsCacheKey); 
            return createdEntity;
        }

        public async Task UpdateDestinationAsync(DestinationEntity destination, List<Guid> categoryIds)
        {
            await _destinationRepository.UpdateAsync(destination, categoryIds);
            await _redisDb.KeyDeleteAsync(PopularDestinationsCacheKey);
        }

        public async Task DeleteDestinationAsync(Guid id)
        {
            await _destinationRepository.DeleteAsync(id);
            await _redisDb.KeyDeleteAsync(PopularDestinationsCacheKey);
        }
    }
}