using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TourService.Data;
using TourService.Repositories;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<TourDbContext>(options =>
{
    options.UseNpgsql(connectionString); 
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<IDestinationRepository, DestinationRepository>();
builder.Services.AddScoped<ITourRepository, TourRepository>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TourService API", Version = "v1" });
});
var app = builder.Build();
app.UseRouting();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TourService API V1");
        c.RoutePrefix = "swagger"; // /swagger
    });
}

//ApplyMigration();

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

