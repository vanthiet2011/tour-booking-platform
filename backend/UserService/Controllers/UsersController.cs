using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using UserService.Dtos;
using UserService.Entities;
using UserService.Enums;
using UserService.Repositories;

namespace UserService.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class UsersController : ControllerBase
  {
    private readonly IUserRepository _userRepository;
    public UsersController(IUserRepository userRepository)
    {
      _userRepository = userRepository;
    }
    // POST: api/users
    [HttpPost]
    public async Task<ActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
    {
      if (await _userRepository.GetUserByEmailAsync(createUserDto.Email!) != null)
      {
        return Conflict("Email already exists");
      }
      var user = new UserEntity
      {
        Id = Guid.NewGuid(),
        Email = createUserDto.Email,
        PasswordHash = createUserDto.PasswordHash,
        Name = createUserDto.Name,
        Role = Enum.Parse<UserRole>(createUserDto.Role!),
        CreatedAt = DateTime.UtcNow
      };
      await _userRepository.CreateUserAsync(user);
      var userToReturn = new
      {
        user.Id,
        user.Email,
        user.Name,
        user.Role,
      };
      return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, userToReturn);
    }

    // GET: api/Users/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id)
    {
      var user = await _userRepository.GetUserByIdAsync(id);
      if (user == null)
      {
        return NotFound("User not found");
      }
      var userDto = new UserDto
      {
        Id = user.Id,
        Email = user.Email,
        Name = user.Name,
        Role = user.Role
      };
      return userDto;
    }

    // GET: api/Users/byemail/{email}
    [HttpGet("byemail/{email}")]
    public async Task<ActionResult<UserDto>> GetUserByEmail(string email)
    {
      var user = await _userRepository.GetUserByEmailAsync(email);
      if (user == null)
      {
        return NotFound("User not found");
      }
      var userDto = new UserDto
      {
        Id = user.Id,
        Email = user.Email,
        Name = user.Name,
        Role = user.Role
      };
      return userDto;
    }

    // POST: api/Users/login
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto loginDto)
    {
      var user = await _userRepository.GetUserByEmailAsync(loginDto.Email!);
      if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash!))
      {
        return Unauthorized("Invalid credentials");
      }
      var userDto = new UserDto
      {
        Id = user.Id,
        Email = user.Email,
        Name = user.Name,
        Role = user.Role
      };
      return userDto;
    }
  }
}