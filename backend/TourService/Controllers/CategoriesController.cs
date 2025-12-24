
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourService.Dtos;
using TourService.Entities;
using TourService.Services;

namespace TourService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService, IMapper mapper)
        {
            _categoryService = categoryService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var dtos = await _categoryService.GetAllCategoriesAsync();
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(Guid id)
        {
            var dto = await _categoryService.GetCategoryByIdAsync(id);

            if (dto == null)
            {
                return NotFound();
            }
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

            var dto = await _categoryService.CreateCategoryAsync(createDto);
            return CreatedAtAction(nameof(GetCategoryById), new { id = dto.Id }, dto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingEntity = await _categoryService.GetCategoryByIdAsync(id);
            if (existingEntity == null)
            {
                return NotFound();
            }
            existingEntity.Name = updateDto.Name;

            await _categoryService.UpdateCategoryAsync(id, updateDto);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var existingEntity = await _categoryService.GetCategoryByIdAsync(id);
            if (existingEntity == null)
            {
                return NotFound();
            }

            await _categoryService.DeleteCategoryAsync(id);

            return NoContent();
        }
    }
}