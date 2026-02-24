using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using BookingService.Data;
using BookingService.Repositories;
using BookingService.Services;
using System.Text;
using System.Text.Json.Serialization;
using Confluent.Kafka;
using System.Text.Json;
using BookingService.Kafka.Producers;
using BookingService.Kafka.Consumers;
using Hangfire;
using Hangfire.PostgreSql;
using BookingService.Filters;
using Serilog;
using Serilog.Exceptions;
using BookingService.Middleware;


var builder = WebApplication.CreateBuilder(args);

// Cấu hình Serilog
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .Enrich.WithExceptionDetails()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "BookingService") // Tên service để lọc log
    .WriteTo.Console()
    .WriteTo.Http("http://logstash:5044", queueLimitBytes: null) // Gửi log tới Logstash
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();

var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<BookingDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});


builder.Services.AddSingleton<IProducer<string, string>>(sp =>
{
    var kafkaBootstrapServers = builder.Configuration["Kafka:BootstrapServers"];
    if (string.IsNullOrEmpty(kafkaBootstrapServers))
    {
        throw new InvalidOperationException("KAFKA_BOOTSTRAP_SERVERS is not configured.");
    }
    var config = new ProducerConfig { BootstrapServers = kafkaBootstrapServers };
    return new ProducerBuilder<string, string>(config).Build();
});

builder.Services.AddSingleton<IBookingKafkaProducerService, BookingKafkaProducerService>();
builder.Services.AddSingleton<ConsumerConfig>(sp =>
{
    var kafkaBootstrapServers = builder.Configuration["Kafka:BootstrapServers"];
    if (string.IsNullOrEmpty(kafkaBootstrapServers))
    {
        throw new InvalidOperationException("Kafka:BootstrapServers chưa được cấu hình trong appsettings.json.");
    }
    
    return new ConsumerConfig
    {
        BootstrapServers = kafkaBootstrapServers,
        AutoOffsetReset = AutoOffsetReset.Earliest,
        EnableAutoCommit = false
    };
});



builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(options => options.UseNpgsqlConnection(connectionString)));

builder.Services.AddHangfireServer();

builder.Services.AddHostedService<SlotsResponseConsumer>();
builder.Services.AddHostedService<PaymentResultConsumer>();
// BookingCompletionWorker removed (replaced by Hangfire)

builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IBookingService, BookingService.Services.BookingService>();
builder.Services.AddScoped<IBookingJobService, BookingJobService>();


builder.Services.AddHttpClient<ITourServiceClient, TourServiceClient>(client =>
{
    var tourServiceUrl = builder.Configuration["Services:TourServiceUrl"] ?? "http://tour-service:8080";
    client.BaseAddress = new Uri(tourServiceUrl);
});


builder.Services.Configure<JsonSerializerOptions>(options =>
{
    options.PropertyNameCaseInsensitive = true;
});

builder.Services.AddAutoMapper(typeof(Program));

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
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!))
    };
});

// Cấu hình Authorization
builder.Services.AddAuthorization();

// Cấu hình Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BookingService API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Vui lòng nhập JWT với Bearer vào trường này",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        new string[] {}
    }});
});

builder.Services.AddOpenApi();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BookingService API v1");
    });
}



app.UseRouting();

app.UseMiddleware<CorrelationIdMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});

// Schedule Recurring Job
RecurringJob.AddOrUpdate<IBookingJobService>(
    "complete-bookings-job",
    service => service.CheckAndCompleteBookings(),
    Cron.Hourly
);

app.MapControllers();

app.Run();