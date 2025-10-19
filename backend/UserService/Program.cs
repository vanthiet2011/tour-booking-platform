using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UserService.Data;
using UserService.Repositories;
using System.Text.Json.Serialization;
using UserService.Kafka;
using UserService.Services;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// --- Kết nối Database ---
var connectionString = configuration.GetConnectionString("Default");
builder.Services.AddDbContext<UserDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddAutoMapper(typeof(Program).Assembly);
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
// --- Cấu hình CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// --- Cấu hình Authentication ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Khớp với cấu hình JwtSettings của bạn
        ValidIssuer = configuration["JwtSettings:Issuer"],
        ValidAudience = configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:SecretKey"]!)),

        // Bật các kiểm tra cần thiết
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true, // Nên bật để kiểm tra token hết hạn
        ValidateIssuerSigningKey = true
    };
});

// Thêm Authorization
builder.Services.AddAuthorization();


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Đăng ký Repository
builder.Services.AddScoped<IUserProfileRepository, UserProfileRepository>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddHostedService<UserCreationConsumer>();

var app = builder.Build();

// --- Cấu hình HTTP request pipeline ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// QUAN TRỌNG: Thêm UseAuthentication và UseAuthorization VÀO ĐÚNG THỨ TỰ
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();