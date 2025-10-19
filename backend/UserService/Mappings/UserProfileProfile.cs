using AutoMapper;
using UserService.Dtos;
using UserService.Entities;

namespace UserService.Mappings;

public class UserProfileProfile : Profile
{
    public UserProfileProfile()
    {
        CreateMap<UpdateProfileDto, UserProfileEntity>();
    }
}