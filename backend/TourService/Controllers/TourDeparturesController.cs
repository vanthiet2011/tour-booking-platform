using Microsoft.AspNetCore.Mvc;
using TourService.Dtos;
using TourService.Repositories;

namespace TourService.Controllers;

[ApiController]
[Route("[controller]")]
public class TourDeparturesController : ControllerBase
{
    private readonly ITourDepartureRepository _departureRepository;

    public TourDeparturesController(ITourDepartureRepository departureRepository)
    {
        _departureRepository = departureRepository;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDepartureDetails(Guid id)
    {
        var departure = await _departureRepository.GetByIdWithTourAsync(id);
        if (departure == null)
        {
            return NotFound(new { message = "Không tìm thấy chuyến khởi hành." });
        }
        if (departure.Tour == null)
        {
            return NotFound(new { message = "Không tìm thấy thông tin tour cho chuyến khởi hành này." });
        }
        var response = new TourDepartureDto
        {
            Id = departure.Id,
            TourId = departure.Tour.Id,
            StartDate = departure.StartDate,
            EndDate = departure.EndDate,
            AvailableSlots = departure.AvailableSlots
        };
        return Ok(response);
    }
}