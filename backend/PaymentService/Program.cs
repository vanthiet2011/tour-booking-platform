using Microsoft.EntityFrameworkCore;
using PaymentService.Data;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<PaymentDbContext>(options =>
{
    options.UseNpgsql(connectionString); 
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.Run();