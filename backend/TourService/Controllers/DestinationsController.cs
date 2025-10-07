// Trong thư mục Controllers/DestinationsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourService.Dtos;
using TourService.Entities;
using TourService.Repositories;

namespace TourService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DestinationsController : ControllerBase
    {
      private readonly IDestinationRepository _repository;

      public DestinationsController(IDestinationRepository repository)
      {
          _repository = repository;
      }

      // GET: api/destinations
      [HttpGet]
      public async Task<IActionResult> GetAllDestinations()
      {
          var destinations = await _repository.GetAllAsync();
          return Ok(destinations);
      }
      
      [HttpGet("popular")]
        public async Task<IActionResult> GetPopularDestinations()
        {
            var popularDestinations = await _repository.GetPopularAsync(5);
            return Ok(popularDestinations);
        }

      // GET: api/destinations/{id}
        [HttpGet("{id}")]
      public async Task<IActionResult> GetDestinationById(Guid id)
      {
          var destination = await _repository.GetByIdAsync(id);
          if (destination == null)
          {
              return NotFound();
          }
          return Ok(destination);
      }

      // POST: api/destinations
      [HttpPost]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> CreateDestination([FromBody] CreateDestinationDto dto)
      {
          var newDestination = new DestinationEntity
          {
              DestinationId = Guid.NewGuid(),
              Name = dto.Name,
              Description = dto.Description,
              ImageUrl = dto.ImageUrl,
              Region = dto.Region,
              IsPopular = dto.IsPopular,
              CreatedAt = DateTime.UtcNow
          };

          await _repository.CreateAsync(newDestination);
          return CreatedAtAction(nameof(GetDestinationById), new { id = newDestination.DestinationId }, newDestination);
      }

      // PUT: api/destinations/{id}
      [HttpPut("{id}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> UpdateDestination(Guid id, [FromBody] UpdateDestinationDto dto)
      {
          var existingDestination = await _repository.GetByIdAsync(id);
          if (existingDestination == null)
          {
              return NotFound();
          }

          existingDestination.Name = dto.Name;
          existingDestination.Description = dto.Description;
          existingDestination.ImageUrl = dto.ImageUrl;
          existingDestination.Region = dto.Region;
          existingDestination.IsPopular = dto.IsPopular;

          await _repository.UpdateAsync(existingDestination);
          return NoContent(); // Trả về 204 No Content khi cập nhật thành công
      }

      // DELETE: api/destinations/{id}
      [HttpDelete("{id}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> DeleteDestination(Guid id)
      {
          var existingDestination = await _repository.GetByIdAsync(id);
          if (existingDestination == null)
          {
              return NotFound();
          }

          await _repository.DeleteAsync(id);
          return NoContent(); // Trả về 204 No Content khi xóa thành công
      }
    }
}