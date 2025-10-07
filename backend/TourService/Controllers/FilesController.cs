using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace TourService.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class FilesController : ControllerBase
  {
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public FilesController(IWebHostEnvironment environment,IConfiguration configuration)
    {
      _environment = environment;
      _configuration = configuration;
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
      if (file == null || file.Length == 0)
        return BadRequest("No file uploaded.");

      var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");
      if (!Directory.Exists(uploadsPath))
      {
        Directory.CreateDirectory(uploadsPath);
      }

      var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
      var filePath = Path.Combine(uploadsPath, fileName);

      using (var stream = new FileStream(filePath, FileMode.Create))
      {
        await file.CopyToAsync(stream);
      }

      var baseUrl = _configuration["ServicePublicUrl"] ?? $"{Request.Scheme}://{Request.Host}";

      var fileUrl = $"{baseUrl}/uploads/{fileName}";
      return Ok(new { Url = fileUrl });
    }
  }
}