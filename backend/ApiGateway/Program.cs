using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Serilog;
using Serilog.Exceptions;
using ApiGateway.Middleware;


var builder = WebApplication.CreateBuilder(args);

// Cấu hình Serilog
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .Enrich.WithExceptionDetails()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "ApiGateway") // Tên service để lọc log
    .WriteTo.Console()
    .WriteTo.Http("http://logstash:5044", queueLimitBytes: null) // Gửi log tới Logstash
    .CreateLogger();

builder.Host.UseSerilog();

// Đọc file ocelot.json
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// Thêm dịch vụ CORS
builder.Services.AddCors(); 

// Thêm Ocelot
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();

app.UseCors(policy => policy
    .WithOrigins("http://localhost:3000", "https://localhost:3000")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

await app.UseOcelot();

app.Run();