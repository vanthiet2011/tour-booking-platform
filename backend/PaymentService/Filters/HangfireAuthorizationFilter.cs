using Hangfire.Dashboard;

namespace PaymentService.Filters;

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        return true; // Allow all requests (Dev only)
    }
}
