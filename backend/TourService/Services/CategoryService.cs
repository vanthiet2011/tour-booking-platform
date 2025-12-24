// File: TourService/Services/CategoryService.cs
using AutoMapper;
using TourService.Dtos;
using TourService.Constants;
using TourService.Repositories;
using TourService.Entities;

namespace TourService.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ICachingService _cachingService;
        private readonly IMapper _mapper;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(
            ICategoryRepository categoryRepository,
            ICachingService cachingService,
            IMapper mapper,
            ILogger<CategoryService> logger)
        {
            _categoryRepository = categoryRepository;
            _cachingService = cachingService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var cached = await _cachingService.GetAsync<IEnumerable<CategoryDto>>(CacheKeys.CategoryList);
            if (cached != null) return cached;

            var entities = await _categoryRepository.GetAllAsync();
            var dtos = _mapper.Map<IEnumerable<CategoryDto>>(entities);

            await _cachingService.SetAsync(CacheKeys.CategoryList, dtos, TimeSpan.FromHours(24));

            return dtos;
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(Guid id)
        {
            string cacheKey = CacheKeys.GetCategoryByIdKey(id);
            var cached = await _cachingService.GetAsync<CategoryDto>(cacheKey);
            if (cached != null) return cached;

            var entity = await _categoryRepository.GetByIdAsync(id);
            if (entity == null || entity.Id == Guid.Empty) return null;

            var dto = _mapper.Map<CategoryDto>(entity);
            await _cachingService.SetAsync(cacheKey, dto, TimeSpan.FromHours(24));

            return dto;
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
        {
            var entity = _mapper.Map<CategoryEntity>(dto);
            await _categoryRepository.CreateAsync(entity);

            await _cachingService.InvalidateCategoryCacheAsync();

            return _mapper.Map<CategoryDto>(entity);
        }

        public async Task UpdateCategoryAsync(Guid id, UpdateCategoryDto dto)
        {
            var entity = await _categoryRepository.GetByIdAsync(id);
            if (entity == null) return;

            _mapper.Map(dto, entity);
            await _categoryRepository.UpdateAsync(entity);

            await _cachingService.InvalidateCategoryCacheAsync(id);
        }

        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            var result = await _categoryRepository.DeleteAsync(id);
            if (result)
            {
                await _cachingService.InvalidateCategoryCacheAsync();
            }
            return result;
        }
    }
}