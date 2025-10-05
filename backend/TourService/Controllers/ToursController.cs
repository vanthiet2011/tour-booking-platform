// Trong thư mục Controllers/ToursController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourService.Dtos;
using TourService.Entities;
using TourService.Repositories;

namespace TourService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly ITourRepository _repository;

        public ToursController(ITourRepository repository)
        {
            _repository = repository;
        }

        // GET: api/tours
        [HttpGet]
        public async Task<IActionResult> GetAllTours()
        {
            var tours = await _repository.GetAllAsync();
            return Ok(tours);
        }

        // GET: api/tours/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTourById(Guid id)
        {
            var tour = await _repository.GetByIdAsync(id);
            if (tour == null)
            {
                return NotFound();
            }
            return Ok(tour);
        }

        // POST: api/tours
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTour([FromBody] CreateTourDto dto)
        {
            var newTour = new TourEntity
            {
                TourId = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Capacity = dto.Capacity,
                Duration = dto.Duration,
                CreatedAt = DateTime.UtcNow
            };

            // Thêm các điểm đến vào tour
            foreach (var destId in dto.DestinationIds)
            {
                newTour.TourDestinations.Add(new TourDestinationEntity { DestinationId = destId });
            }

            // Thêm các lịch trình vào tour
            foreach (var scheduleDto in dto.Schedules)
            {
                newTour.TourSchedules.Add(new TourScheduleEntity
                {
                    ScheduleId = Guid.NewGuid(),
                    StartDate = scheduleDto.StartDate,
                    EndDate = scheduleDto.EndDate,
                    SeatsAvailable = scheduleDto.SeatsAvailable
                });
            }

            await _repository.CreateAsync(newTour);
            return CreatedAtAction(nameof(GetTourById), new { id = newTour.TourId }, newTour);
        }

        // PUT: api/tours/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTour(Guid id, [FromBody] UpdateTourDto dto)
        {
            var existingTour = await _repository.GetByIdAsync(id);
            if (existingTour == null)
            {
                return NotFound();
            }

            existingTour.Title = dto.Title;
            existingTour.Description = dto.Description;
            existingTour.Price = dto.Price;
            existingTour.Capacity = dto.Capacity;
            existingTour.Duration = dto.Duration;
            
            // Cập nhật lại danh sách điểm đến
            existingTour.TourDestinations.Clear();
            foreach (var destId in dto.DestinationIds)
            {
                existingTour.TourDestinations.Add(new TourDestinationEntity { DestinationId = destId, TourId = id });
            }

            await _repository.UpdateAsync(existingTour);
            return NoContent();
        }

        // DELETE: api/tours/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTour(Guid id)
        {
            var existingTour = await _repository.GetByIdAsync(id);
            if (existingTour == null)
            {
                return NotFound();
            }
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}