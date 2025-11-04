using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace TourService.Controllers
{
  [ApiController]
  [Route("[controller]")]
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
    [Authorize]
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
      return Ok(new { filePath = fileUrl });
    }

    [HttpPost("upload-multiple")]
    [Authorize]
    public async Task<IActionResult> UploadMultipleImages(List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
            return BadRequest("No files uploaded.");

        var uploadedFilePaths = new List<string>();
        
        // Kiểm tra và tạo thư mục uploads nếu chưa có
        var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        foreach (var file in files)
        {
            if (file.Length > 0)
            {
                // Tạo tên file độc nhất
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadsPath, fileName);

                // Lưu file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                // Thêm đường dẫn tương đối vào danh sách
                uploadedFilePaths.Add($"uploads/{fileName}");
            }
        }

        return Ok(new { filePaths = uploadedFilePaths });
    }
  }
}