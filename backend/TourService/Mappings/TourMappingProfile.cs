using AutoMapper;
using TourService.Dtos;
using TourService.Entities;
using TourService.Models;

namespace TourService.Mappings
{
    public class TourMappingProfile : Profile
    {
        public TourMappingProfile()
        {
            CreateMap<TourEntity, TourListDto>()
                .ForMember(dest => dest.PricePerAdult, opt => opt.MapFrom(src => src.PricePerAdult))
                .ForMember(dest => dest.Destinations, opt => opt.MapFrom(src => src.TourDestinations))
                .ForMember(dest => dest.AvailableSlots, opt => opt.MapFrom(src => 
                    src.TourDepartures
                        .Where(d => d.StartDate > DateTime.UtcNow)
                        .Sum(d => d.AvailableSlots)));
            CreateMap(typeof(PaginatedResponse<>), typeof(PaginatedResponse<>));
            // CreateMap<PaginatedResponse<TourEntity>, PaginatedResponse<TourDetailDto>>();
            CreateMap<TourScheduleEntity, TourScheduleDto>();
            CreateMap<TourDepartureEntity, TourDepartureDto>();

            CreateMap<CreateDestinationDto, DestinationEntity>().ForMember(dest => dest.DestinationCategories, opt => opt.Ignore());
            CreateMap<UpdateDestinationDto, DestinationEntity>();

            CreateMap<CategoryEntity, CategoryDto>();
            CreateMap<DestinationEntity, DestinationResponseDto>()
                .ForMember(
                    destDto => destDto.Categories,
                    opt => opt.MapFrom(
                        srcEntity => srcEntity.DestinationCategories
                                            .Select(dc => dc.Category)
                    )
                );
            
            CreateMap<TourDestinationEntity, DestinationSummaryDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Destination != null ? src.Destination.Id : Guid.Empty))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Destination != null ? src.Destination.Name : "Không xác định"));

            CreateMap<TourEntity, TourDetailDto>()
                .ForMember(dest => dest.Destinations, opt => opt.MapFrom(src => src.TourDestinations))
                .ForMember(dest => dest.Schedules, opt => opt.MapFrom(src => src.TourSchedules))
                .ForMember(dest => dest.TourDepartures, opt => opt.MapFrom(src => src.TourDepartures));

            CreateMap<TourScheduleDto, TourScheduleEntity>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));
            
            CreateMap<TourDepartureDto, TourDepartureEntity>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));

            CreateMap<CreateTourDto, TourEntity>()
                .ForMember(dest => dest.TourDestinations, opt => opt.MapFrom(src => 
                    src.DestinationIds.Select(id => new TourDestinationEntity { DestinationId = id })))
                .ForMember(dest => dest.TourSchedules, opt => opt.MapFrom(src => src.Schedules))
                .ForMember(dest => dest.TourDepartures, opt => opt.MapFrom(src => src.TourDepartures));

            CreateMap<UpdateTourDto, TourEntity>()
                .ForMember(dest => dest.TourDestinations, opt => opt.MapFrom(src =>
                    src.DestinationIds.Select(id => new TourDestinationEntity { DestinationId = id })))
                .ForMember(dest => dest.TourSchedules, opt => opt.MapFrom(src => src.Schedules))
                .ForMember(dest => dest.TourDepartures, opt => opt.MapFrom(src => src.TourDepartures));
        }
    }
}