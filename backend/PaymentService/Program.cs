using Confluent.Kafka;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Kafka.Consumers;
using PaymentService.Kafka.Producers;
using PaymentService.Repositories;
using PaymentService.Services;
using Microsoft.OpenApi.Models;
using PaymentService.Services.Providers;
using Hangfire;
using Hangfire.PostgreSql;
using Serilog;
using Serilog.Exceptions;
using PaymentService.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Serilog
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .Enrich.WithExceptionDetails()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "PaymentService") // Tên service để lọc log
    .WriteTo.Console()
    .WriteTo.Http("http://logstash:5044", queueLimitBytes: null) // Gửi log tới Logstash
    .CreateLogger();

builder.Host.UseSerilog();
var configuration = builder.Configuration;
var connectionString = configuration.GetConnectionString("Default");

builder.Services.AddDbContext<PaymentDbContext>(options =>
{
    options.UseNpgsql(connectionString); 
});

builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService.Services.PaymentService>();
builder.Services.AddScoped<IPaymentJobService, PaymentJobService>();

builder.Services.AddSingleton<IPaymentKafkaProducerService, PaymentKafkaProducerService>();

builder.Services.AddSingleton<IProducer<string, string>>(sp =>
{
    var config = new ProducerConfig { 
        BootstrapServers = configuration["Kafka:BootstrapServers"],
        Acks = Acks.All // Đảm bảo tin nhắn được ghi nhận an toàn
    };
    return new ProducerBuilder<string, string>(config).Build();
});

builder.Services.AddSingleton<ConsumerConfig>(sp =>
{
    return new ConsumerConfig
    {
        BootstrapServers = configuration["Kafka:BootstrapServers"],
        GroupId = "payment-service-group", // THÊM DÒNG NÀY
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

builder.Services.AddHostedService<PaymentCreationConsumer>();

builder.Services.AddHttpClient<PayPalProvider>(client =>
{
    client.BaseAddress = new Uri(
        configuration["PayPal:BaseUrl"]
        ?? "https://api-m.sandbox.paypal.com"
    );
});

builder.Services.AddScoped<IPaymentProvider>(sp =>
    sp.GetRequiredService<PayPalProvider>());

builder.Services.AddScoped<IPaymentProvider, VnPayProvider>();
builder.Services.AddScoped<IPaymentProvider, OfficeProvider>();


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Payment Service API", Version = "v1" });
});

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[] { new PaymentService.Filters.HangfireAuthorizationFilter() }
    });
    
    try
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
        await context.Database.MigrateAsync();
        Console.WriteLine("✅ Database Migrated Successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Migration Error: {ex.Message}");
    }
}

app.UseCors();
app.UseRouting();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();