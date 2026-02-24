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

        CreateMap<BookingEntity, BookingSummaryResponseDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src =>
                (src.Status == BookingStatus.Confirmed || src.Status == BookingStatus.Completed) ? "Completed" :
                (src.Status == BookingStatus.Pending && src.PaymentMethod == "AtOffice") ? "AwaitingOffice" :
                (src.Status == BookingStatus.Pending) ? "Pending" :
                (src.Status == BookingStatus.Failed) ? "Failed" : 
                (src.Status == BookingStatus.Cancelled && src.FailureReason == BookingFailureReason.PaymentExpired.ToString()) ? "Expired" :
                (src.Status == BookingStatus.Cancelled && src.FailureReason == BookingFailureReason.PaymentFailed.ToString()) ? "Failed" :
                (src.Status == BookingStatus.Cancelled && src.FailureReason != null && (src.FailureReason.Contains("Failed", StringComparison.OrdinalIgnoreCase) || src.FailureReason.Contains("error", StringComparison.OrdinalIgnoreCase))) ? "Failed" :
                (src.Status == BookingStatus.Cancelled) ? "Cancelled" : 
                "Unknown"
            ))
            .ForMember(dest => dest.Adults, opt => opt.MapFrom(src => src.BookingDetails
                .Where(d => d.ParticipantType == ParticipantType.Adult).Sum(d => d.Quantity)))
            .ForMember(dest => dest.Children, opt => opt.MapFrom(src => src.BookingDetails
                .Where(d => d.ParticipantType == ParticipantType.Child).Sum(d => d.Quantity)))
            .ForMember(dest => dest.Infants, opt => opt.MapFrom(src => src.BookingDetails
                .Where(d => d.ParticipantType == ParticipantType.Infant).Sum(d => d.Quantity)));

        CreateMap<BookingDetailEntity, BookingDetailResponseDto>();

        CreateMap<BookingEntity, BookingConfirmedEvent>()
            .ForMember(dest => dest.ParticipantsCount, 
                opt => opt.MapFrom(src => src.BookingDetails.Sum(d => d.Quantity)))
            .ForMember(dest => dest.ConfirmedAt, 
                opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.PaymentMethod, 
                opt => opt.MapFrom(src => src.PaymentMethod ?? "Unknown"));
    }
}