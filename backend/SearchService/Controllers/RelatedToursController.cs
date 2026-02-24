using Microsoft.AspNetCore.Mvc;
using SearchService.Models;
using SearchService.Services;
using SearchService.Dtos;
using System.Linq;

namespace SearchService.Controllers
{
    [ApiController]
    [Route("api/tours")]
    public class RelatedToursController : ControllerBase
    {
        private readonly ITourSearchService _tourSearchService;

        public RelatedToursController(ITourSearchService tourSearchService)
        {
            _tourSearchService = tourSearchService;
        }

        [HttpGet("{id}/related")]
        public async Task<ActionResult<IEnumerable<RelatedTourDto>>> GetRelatedTours(Guid id)
        {
            var relatedTours = await _tourSearchService.GetRelatedToursAsync(id);
            
            var result = relatedTours.Select(t => new RelatedTourDto
            {
                Id = t.Id,
                Name = t.Name,
                PricePerAdult = t.Price,
                ImageUrl = t.ImageUrl,
                Duration = t.Duration,
                AvailableSlots = t.AvailableSlots,
                Destinations = t.Destinations.Any() 
                    ? t.Destinations.Select(d => new DestinationDto { Name = d }).ToList()
                    : new List<DestinationDto> { new DestinationDto { Name = t.Region } } // Fallback to Region if no destinations
            });

            return Ok(result);
        }
    }
}
