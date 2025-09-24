using Microsoft.EntityFrameworkCore;
using TourService.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<TourDbContext>(options =>
{
    options.UseNpgsql(connectionString); 
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{

}

//ApplyMigration();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

