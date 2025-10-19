using Confluent.Kafka;
using System.Text.Json;
using UserService.Dtos;
using UserService.Services;

namespace UserService.Kafka;

public class UserCreationConsumer : BackgroundService
{
    private readonly IConsumer<string, string> _consumer;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<UserCreationConsumer> _logger;

    public UserCreationConsumer(IConfiguration config, IServiceProvider serviceProvider, ILogger<UserCreationConsumer> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = config["Kafka:BootstrapServers"],
            GroupId = "user-service-group",
            AutoOffsetReset = AutoOffsetReset.Earliest // Bắt đầu đọc từ message cũ nhất nếu chưa có offset
        };
        _consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _consumer.Subscribe("user-creation-topic");
        _logger.LogInformation("--> UserService is waiting for 'user-creation-topic' messages...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var consumeResult = _consumer.Consume(stoppingToken);
                if (consumeResult?.Message?.Value == null) continue;

                var userDto = JsonSerializer.Deserialize<UserCreatedDto>(consumeResult.Message.Value);

                if (userDto != null)
                {
                    _logger.LogInformation("--> Received UserCreated event for User ID: {UserId}", userDto.Id);
                    using var scope = _serviceProvider.CreateScope();
                    var userService = scope.ServiceProvider.GetRequiredService<IUserProfileService>();
                    await userService.CreateProfileFromEventAsync(userDto);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("--> Kafka consumer is shutting down.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "--> Error processing Kafka message.");
            }
        }
    }

    public override void Dispose()
    {
        _consumer.Close();
        _consumer.Dispose();
        base.Dispose();
    }
}