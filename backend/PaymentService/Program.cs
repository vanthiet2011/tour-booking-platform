using Confluent.Kafka;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Kafka.Consumers;
using PaymentService.Kafka.Producers;
using PaymentService.Repositories;
using PaymentService.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;
var connectionString = configuration.GetConnectionString("Default");

builder.Services.AddDbContext<PaymentDbContext>(options =>
{
    options.UseNpgsql(connectionString); 
});

builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService.Services.PaymentService>();
builder.Services.AddScoped<IPaymentKafkaProducerService, PaymentKafkaProducerService>();

builder.Services.AddSingleton<IProducer<string, string>>(sp =>
{
    var kafkaBootstrapServers = configuration["Kafka:BootstrapServers"];
    var config = new ProducerConfig { BootstrapServers = kafkaBootstrapServers };
    return new ProducerBuilder<string, string>(config).Build();
});


builder.Services.AddSingleton<ConsumerConfig>(sp =>
{
    var kafkaBootstrapServers = configuration["Kafka:BootstrapServers"];
    return new ConsumerConfig
    {
        BootstrapServers = kafkaBootstrapServers,
        AutoOffsetReset = AutoOffsetReset.Earliest,
        EnableAutoCommit = false
    };
});

builder.Services.AddHostedService<PaymentCreationConsumer>();

builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Payment Service API",
        Version = "v1",
        Description = "API cho Dịch vụ Thanh toán"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "PaymentService v1");
    });
}

try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<PaymentDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Đang kiểm tra và áp dụng migration cho PaymentDbContext...");
        await context.Database.MigrateAsync();
        logger.LogInformation("Áp dụng migration thành công.");
    }
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Đã xảy ra lỗi khi áp dụng migration cho PaymentDbContext.");
}

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();