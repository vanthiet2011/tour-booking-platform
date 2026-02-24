using Confluent.Kafka;
using System.Text.Json;
using UserService.Dtos;
using UserService.Services;
using UserService.Data;
using UserService.Entities;
using Microsoft.EntityFrameworkCore;

namespace UserService.Kafka.Consumers
{
    public class UserCreationConsumer : BackgroundService
    {
        private readonly ILogger<UserCreationConsumer> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private IConsumer<string, string>? _consumer;
        private readonly string[] _topics = { 
            "dev.vietnature.auth-service.user.created" 
        };

        public UserCreationConsumer(IServiceScopeFactory scopeFactory, ILogger<UserCreationConsumer> logger, IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            return Task.Run(() =>
            {
                var consumerConfig = new ConsumerConfig
                {
                    BootstrapServers = _configuration["Kafka:BootstrapServers"],
                    GroupId = "user-service-profile-group-v3",
                    AutoOffsetReset = AutoOffsetReset.Earliest,
                    EnableAutoCommit = true
                };

                using var consumer = new ConsumerBuilder<Ignore, string>(consumerConfig).Build();
                consumer.Subscribe(_topics);

                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult = consumer.Consume(stoppingToken);
                        var message = consumeResult.Message.Value;

                        var userDto = JsonSerializer.Deserialize<UserCreatedDto>(message, 
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                        if (userDto != null)
                        {
                            _logger.LogInformation("👤 [Profile] Đang tạo Profile cho User: {UserId}", userDto.UserId);
                            
                            using var scope = _scopeFactory.CreateScope();
                            var userService = scope.ServiceProvider.GetRequiredService<IUserProfileService>();

                            userService.CreateProfileFromEventAsync(userDto).GetAwaiter().GetResult();
                            
                            _logger.LogInformation("✅ [Profile] Đã tạo xong Profile.");
                        }
                    }
                    catch (OperationCanceledException) { break; }
                    catch (Exception ex) {
                        _logger.LogError(ex, "❌ Lỗi tạo Profile");
                    }
                }
                consumer.Close();
            }, stoppingToken);
        }

        public override void Dispose()
        {
            if (_consumer != null)
            {
                _consumer.Close();
                _consumer.Dispose();
            }
            base.Dispose();
        }
    }
}