using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Services
{
  public class JwtService
  {
    private readonly IConfiguration _configuration;
    public JwtService(IConfiguration configuration) => _configuration = configuration;
    public string GenerateToken(Guid userId, string userEmail, string role)
    {
      var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]!));
      var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
      var claims = new[]
      {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, userEmail.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
      };
      var token = new JwtSecurityToken(
          issuer: _configuration["JwtSettings:Issuer"],
          audience: _configuration["JwtSettings:Audience"],
          claims: claims,
          expires: DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpiryMinutes"])),
          signingCredentials: credentials);
      return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public UserRefreshTokenEntity GenerateRefreshToken(Guid userId)
    {
      return new UserRefreshTokenEntity
      {
        Id = Guid.NewGuid(),
        Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
        ExpiresAt = DateTime.UtcNow.AddDays(7),
        CreatedAt = DateTime.UtcNow,
        UserId = userId
      };
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
      var tokenHandler = new JwtSecurityTokenHandler();
      var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]!);

      try
      {
        var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
          ValidateIssuer = true,
          ValidateAudience = true,
          ValidateLifetime = true,
          ValidateIssuerSigningKey = true,
          ValidIssuer = _configuration["JwtSettings:Issuer"],
          ValidAudience = _configuration["JwtSettings:Audience"],
          IssuerSigningKey = new SymmetricSecurityKey(key),
          ClockSkew = TimeSpan.Zero
        }, out SecurityToken validatedToken);

        return principal;
      }
      catch
      {
        return null;
      }
    }
  }
}