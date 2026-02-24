using Microsoft.AspNetCore.Http;
using Serilog.Context;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SearchService.Middleware
{
    public class CorrelationIdMiddleware
    {
        private readonly RequestDelegate _next;

        public CorrelationIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            var correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault() 
                                ?? Guid.NewGuid().ToString();

            using (LogContext.PushProperty("CorrelationId", correlationId))
            {
                context.Response.Headers.TryAdd("X-Correlation-ID", correlationId);
                await _next(context);
            }
        }
    }
}
