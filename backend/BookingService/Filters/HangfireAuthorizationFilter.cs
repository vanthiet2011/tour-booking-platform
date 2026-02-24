using Hangfire.Dashboard;

namespace BookingService.Filters
{
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            // Allow all access for development
            return true;
        }
    }
}
