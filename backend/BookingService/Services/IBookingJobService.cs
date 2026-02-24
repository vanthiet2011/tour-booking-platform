using System;
using System.Threading.Tasks;

namespace BookingService.Services
{
    public interface IBookingJobService
    {
        Task CheckAndCompleteBookings();
    }
}
