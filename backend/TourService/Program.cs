// TourService/Program.cs

using System.Text;
using System.Text.Json.Serialization;
using Confluent.Kafka;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using StackExchange.Redis;
using TourService.Data;
using TourService.Kafka.Consumers;
using TourService.Kafka.Producers;
using TourService.Repositories;
using TourService.Services;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    WebRootPath = "wwwroot"
});
var configuration = builder.Configuration;

// --- Cấu hình Services ---

// 1. Kết nối DB và Repositories
var connectionString = configuration.GetConnectionString("Default");
var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();
builder.Services.AddDbContext<TourDbContext>(options =>
{
    options.UseNpgsql(dataSource);
});

builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IDestinationRepository, DestinationRepository>();
builder.Services.AddScoped<ITourRepository, TourRepository>();
builder.Services.AddScoped<ITourDepartureRepository, TourDepartureRepository>();
builder.Services.AddScoped<ITourService, TourService.Services.TourService>();
builder.Services.AddScoped<IDestinationService, DestinationService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICachingService, CachingService>();

builder.Services.AddSingleton<IProducer<string, string>>(sp =>
{
    var kafkaBootstrapServers = configuration["Kafka:BootstrapServers"];
    if (string.IsNullOrEmpty(kafkaBootstrapServers))
    {
        throw new InvalidOperationException("Kafka:BootstrapServers chưa được cấu hình trong appsettings.json.");
    }
    var config = new ProducerConfig { BootstrapServers = kafkaBootstrapServers };
    return new ProducerBuilder<string, string>(config).Build();
});

builder.Services.AddSingleton<ITourKafkaProducerService, TourKafkaProducerService>();
builder.Services.AddHostedService<BookingRequestedConsumer>();
builder.Services.AddHostedService<SlotsReleaseConsumer>();


builder.Services.AddAutoMapper(typeof(Program).Assembly);

// 2. Cấu hình Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = configuration["JwtSettings:Issuer"],
        ValidAudience = configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:SecretKey"]!))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();

// 3. Cấu hình Swagger để hỗ trợ JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TourService API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(redisConnectionString!)
);


// --- Cấu hình Pipeline ---

var app = builder.Build();

app.UseRouting();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "TourService API v1"));
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot")
    ),
    RequestPath = ""
});

// Cấu hình static riêng cho /uploads
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads")
    ),
    RequestPath = "/uploads"
});


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();