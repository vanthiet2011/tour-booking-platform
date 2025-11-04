using AutoMapper;
using BookingService.Dtos;
using BookingService.Entities;
using BookingService.Enums;
using BookingService.Events;

namespace BookingService.Mappings;

public class BookingMappingProfile : Profile
{
    public BookingMappingProfile()
    {
        CreateMap<CreateBookingDto, BookingEntity>()
            .ForMember(dest => dest.BookingDetails, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => BookingStatus.Pending))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        CreateMap<BookingEntity, BookingRequestedEvent>()
            .ForMember(dest => dest.BookingId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Participants, opt => opt.MapFrom(src =>
                src.BookingDetails.Select(d => new BookingParticipantInfo
                {
                    Type = d.ParticipantType,
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice
                }).ToList()));

        CreateMap<CreateBookingDto, BookingEntity>();
        CreateMap<ParticipantCountDto, BookingDetailEntity>();

        CreateMap<BookingEntity, BookingResponseDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<BookingDetailEntity, BookingDetailResponseDto>();
    }
}