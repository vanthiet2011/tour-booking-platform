using AutoMapper;
using UserService.Dtos;
using UserService.Entities;
using UserService.Repositories;

namespace UserService.Services;

public class UserProfileService : IUserProfileService
{
    private readonly IUserProfileRepository _profileRepository;
    private readonly ILogger<UserProfileService> _logger;
    private readonly IMapper _mapper;

    public UserProfileService(IUserProfileRepository profileRepository, ILogger<UserProfileService> logger,IMapper mapper)
    {
        _profileRepository = profileRepository;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<UserProfileEntity?> GetProfileByUserIdAsync(Guid userId)
    {
        return await _profileRepository.GetByIdAsync(userId);
    }

    public async Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto updateDto)
    {
        var profile = await _profileRepository.GetByIdAsync(userId);
        if (profile == null)
        {
            return false;
        }
        _mapper.Map(updateDto, profile);

        await _profileRepository.UpdateAsync(profile);
        return true;
    }

    public async Task CreateProfileFromEventAsync(UserCreatedDto userDto)
    {
        if (await _profileRepository.GetByIdAsync(Guid.Parse(userDto.Id.ToString())) != null)
        {
            _logger.LogWarning("--> UserProfile for User ID: {UserId} already exists. Skipping creation.", userDto.Id);
            return;
        }
        var newProfile = new UserProfileEntity { Id = userDto.Id };
        await _profileRepository.CreateAsync(newProfile);
        _logger.LogInformation("--> UserProfile created for User ID: {UserId}", userDto.Id);
    }
}