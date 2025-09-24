using System.ComponentModel.DataAnnotations.Schema;

namespace TourService.Entities
{
    public class TourScheduleEntity
    {
        public Guid Id { get; set; }
        public Guid TourId { get; set; }
        public TourEntity? Tour { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int AvailableSeats { get; set; }
        public int Capacity { get; set; }
    }
}