using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourService.Dtos;
using TourService.Entities;
using TourService.Services;
using System.Collections.Generic;

namespace TourService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DestinationsController : ControllerBase
    {
        private readonly IDestinationService _destinationService;
        private readonly ITourService _tourService;
        private readonly IMapper _mapper;

        public DestinationsController(
            IDestinationService destinationService, 
            ITourService tourService, 
            IMapper mapper)
        {
            _destinationService = destinationService;
            _tourService = tourService;
            _mapper = mapper;
        }

        // GET: destinations
        [HttpGet]
        public async Task<IActionResult> GetAllDestinations(
            [FromQuery] PaginationParams paginationParams,
            [FromQuery] Guid? categoryId = null,
            [FromQuery] string? region = null,
            [FromQuery] string? search = null)
        {
            var paginatedData = await _destinationService.GetAllDestinationsAsync(
                categoryId, 
                region, 
                search, 
                paginationParams
            );
            return Ok(paginatedData);
        }
        
        // GET: destinations/popular
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularDestinations([FromQuery] int count = 5)
        {
            var popularDtos = await _destinationService.GetPopularDestinationsAsync(count);
            return Ok(popularDtos);
        }

        // GET: destinations/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDestinationById(Guid id)
        {
            var entity = await _destinationService.GetDestinationByIdAsync(id);
            if (entity == null) return NotFound();
            var dto = _mapper.Map<DestinationResponseDto>(entity);
            return Ok(dto);
        }
        
        // GET: destinations/{id}/tours
        [HttpGet("{id}/tours")]
        public async Task<IActionResult> GetToursByDestination(Guid id)
        {
             var entities = await _tourService.GetByDestinationIdAsync(id);
             var dtos = _mapper.Map<IEnumerable<TourDetailDto>>(entities);
             return Ok(dtos);
        }

        // POST: destinations
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateDestination([FromBody] CreateDestinationDto dto)
        {
            var newEntity = _mapper.Map<DestinationEntity>(dto);
            newEntity.CreatedAt = DateTime.UtcNow;
            var createdEntity = await _destinationService.CreateDestinationAsync(newEntity, dto.CategoryIds);
            var returnDto = _mapper.Map<DestinationResponseDto>(createdEntity);
            return CreatedAtAction(nameof(GetDestinationById), new { id = returnDto.Id }, returnDto);
        }

        // PUT: destinations/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateDestination(Guid id, [FromBody] UpdateDestinationDto dto)
        {
            var existingDestination = await _destinationService.GetDestinationByIdAsync(id);
            if (existingDestination == null) return NotFound();
            var entityToUpdate = _mapper.Map<DestinationEntity>(dto);
            entityToUpdate.Id = id;
            await _destinationService.UpdateDestinationAsync(entityToUpdate, dto.CategoryIds);
            return NoContent();
        }

        // DELETE: destinations/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDestination(Guid id)
        {
            var existingDestination = await _destinationService.GetDestinationByIdAsync(id);
            if (existingDestination == null) return NotFound();
            await _destinationService.DeleteDestinationAsync(id);         
            return NoContent();
        }
    }
}