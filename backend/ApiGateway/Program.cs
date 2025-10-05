using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Đọc file ocelot.json
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// Thêm dịch vụ CORS
builder.Services.AddCors(); 

// Thêm Ocelot
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

app.UseCors(policy => policy
    .WithOrigins("http://localhost:3000") // Chỉ định nguồn gốc được phép
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

await app.UseOcelot();

app.Run();