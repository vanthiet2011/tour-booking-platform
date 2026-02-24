namespace UserService.Dtos;
public class TopTourDto
{
    public Guid TourId { get; set; }
    public string TourName { get; set; } = string.Empty;
    public int BookedCount { get; set; }
    public int TotalSlots { get; set; }
}