using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourService.Dtos;
using TourService.Repositories;
using TourService.Services;

namespace TourService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly ITourService _tourService;
        private readonly ITourRepository _tourRepository;
        private readonly ITourDepartureRepository _tourDepartureRepository;
        private readonly AutoMapper.IMapper _mapper;

        public ToursController(ITourService tourService, ITourDepartureRepository tourDepartureRepository, ITourRepository tourRepository, AutoMapper.IMapper mapper)
        {
            _tourService = tourService;
            _tourDepartureRepository = tourDepartureRepository;
            _tourRepository = tourRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTours([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            var tours = await _tourService.GetAllToursAsync(page, pageSize, search);
            return Ok(tours);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TourDetailDto>> GetTourById(Guid id)
        {
            var tour = await _tourService.GetTourByIdAsync(id);
            if (tour == null)
            {
                return NotFound();
            }
            return Ok(tour);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTour([FromBody] CreateTourDto createTourDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var newTour = await _tourService.CreateTourAsync(createTourDto);
            return CreatedAtAction(nameof(GetTourById), new { id = newTour.Id }, newTour);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTour(Guid id, [FromBody] UpdateTourDto updateTourDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var success = await _tourService.UpdateTourAsync(id, updateTourDto);
            if (!success)
            {
                return NotFound("Không tìm thấy tour để cập nhật.");
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTour(Guid id)
        {
            var success = await _tourService.DeleteTourAsync(id);
            if (!success)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("{tourId:guid}/departures")]
        public async Task<IActionResult> GetTourDepartures(Guid tourId)
        {
            var tourExists = await _tourRepository.GetByIdAsync(tourId);
            if (tourExists == null)
            {
                return NotFound("Không tìm thấy tour.");
            }

            var departures = await _tourDepartureRepository.GetByTourIdAsync(tourId);
            var departureDtos = _mapper.Map<IEnumerable<TourDepartureDto>>(departures);
            
            return Ok(departureDtos);
        }
    }
}