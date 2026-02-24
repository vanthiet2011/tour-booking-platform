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
        public async Task<IActionResult> GetAllTours(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string? search = null, 
            [FromQuery] decimal? minPrice = null, 
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] int ? minDurationDays = null,
            [FromQuery] int ? maxDurationDays = null,
            [FromQuery] string? region = null,
            [FromQuery] Guid? destinationId = null)
        {
            var tours = await _tourService.GetAllToursAsync(
                page, pageSize, search, minPrice, maxPrice,minDurationDays,maxDurationDays,region, destinationId);
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

        [HttpGet("batch-names")]
        public async Task<ActionResult<Dictionary<Guid, string>>> GetBatchNames([FromQuery] List<Guid> ids)
        {
            var tourNames = await _tourService.GetTourNamesByIdsAsync(ids);
            return Ok(tourNames);
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
        [HttpGet("sync-es")]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SyncToursToElasticsearch()
        {
            await _tourService.SyncAllToursAsync();
            return Ok("Đã bắt đầu quá trình đồng bộ dữ liệu sang Elasticsearch.");
        }
    }
}