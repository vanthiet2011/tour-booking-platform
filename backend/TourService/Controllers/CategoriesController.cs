using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using TourService.Dtos;
using TourService.Entities;
using TourService.Repositories;

namespace TourService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public CategoriesController(ICategoryRepository categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var entities = await _categoryRepository.GetAllAsync();
            var dtos = _mapper.Map<IEnumerable<CategoryDto>>(entities);
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(Guid id)
        {
            var entity = await _categoryRepository.GetByIdAsync(id);

            if (entity == null)
            {
                return NotFound();
            }
            var dto = new CategoryDto
            {
                Id = entity.Id,
                Name = entity.Name,
            };

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var newEntity = new CategoryEntity
            {
                Name = createDto.Name,
            };

            var createdEntity = await _categoryRepository.CreateAsync(newEntity);
            var returnDto = new CategoryDto
            {
                Id = createdEntity.Id,
                Name = createdEntity.Name,
            };

            return CreatedAtAction(nameof(GetCategoryById), new { id = returnDto.Id }, returnDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingEntity = await _categoryRepository.GetByIdAsync(id);
            if (existingEntity == null)
            {
                return NotFound();
            }
            existingEntity.Name = updateDto.Name;

            await _categoryRepository.UpdateAsync(existingEntity);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var existingEntity = await _categoryRepository.GetByIdAsync(id);
            if (existingEntity == null)
            {
                return NotFound();
            }

            await _categoryRepository.DeleteAsync(id);

            return NoContent();
        }
    }
}