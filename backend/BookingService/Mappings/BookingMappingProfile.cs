using AutoMapper;
using BookingService.Dtos;
using BookingService.Entities;

namespace BookingService.Mappings;

public class BookingMappingProfile : Profile
{
    public BookingMappingProfile()
  {
      
        CreateMap<CreateBookingDto, BookingEntity>();
        CreateMap<BookingDetailDto, BookingDetailEntity>();

        CreateMap<BookingEntity, BookingResponseDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<BookingDetailEntity, BookingDetailResponseDto>();
    }
}