using AutoMapper;
using TourService.Dtos;
using TourService.Entities;
using TourService.Events;
using TourService.Kafka.Producers;
using TourService.Repositories;

namespace TourService.Services
{
  public class TourService : ITourService
  {
    private readonly ITourRepository _tourRepository;
    private readonly ITourDepartureRepository _tourDepartureRepository;
    private readonly ITourKafkaProducerService _kafkaProducer;
    private readonly IMapper _mapper;
    private readonly ILogger<TourService> _logger;

    public TourService(ITourRepository tourRepository, IMapper mapper, ILogger<TourService> logger, ITourDepartureRepository tourDepartureRepository,ITourKafkaProducerService kafkaProducer)
    {
      _tourRepository = tourRepository;
      _mapper = mapper;
      _logger = logger;
      _tourDepartureRepository = tourDepartureRepository;
      _kafkaProducer = kafkaProducer;
    }

    public async Task<IEnumerable<TourDetailDto>> GetAllAsync()
    {
      var tourEntitties = await _tourRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<TourDetailDto>>(tourEntitties);
    }

    public async Task<TourDetailDto?> GetByIdAsync(Guid id)
    {
      var tourEntity = await _tourRepository.GetByIdAsync(id);
      if (tourEntity == null)
      {
          return null;
      }
      return _mapper.Map<TourDetailDto>(tourEntity);
    }
    
    public async Task<IEnumerable<TourDetailDto>> GetByDestinationIdAsync(Guid destinationId)
    {
      var tourEntities = await _tourRepository.GetByDestinationIdAsync(destinationId);
      try
      {
        var tourDtos = _mapper.Map<IEnumerable<TourDetailDto>>(tourEntities);
        return tourDtos;
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Lỗi nghiêm trọng khi mapping TourEntity sang TourDetailDto cho destination ID: {DestinationId}", destinationId);
        throw;
      }
    }

    public async Task<TourEntity> CreateAsync(CreateTourDto createTourDto)
    {
      var tourEntity = _mapper.Map<TourEntity>(createTourDto);
      foreach (var departure in tourEntity.TourDepartures)
      {
          departure.StartDate = DateTime.SpecifyKind(departure.StartDate, DateTimeKind.Utc);
          departure.EndDate = DateTime.SpecifyKind(departure.EndDate, DateTimeKind.Utc);
      }
      return await _tourRepository.CreateAsync(tourEntity);
    }
    
    public async Task<TourEntity?> UpdateAsync(Guid id, UpdateTourDto updateTourDto)
    {
      var tourToUpdate = _mapper.Map<TourEntity>(updateTourDto);
      tourToUpdate.Id = id;
      foreach (var departure in tourToUpdate.TourDepartures)
      {
        departure.StartDate = DateTime.SpecifyKind(departure.StartDate, DateTimeKind.Utc);
        departure.EndDate = DateTime.SpecifyKind(departure.EndDate, DateTimeKind.Utc);
      }
      try
      {
        return await _tourRepository.UpdateAsync(tourToUpdate);
      }
      catch (KeyNotFoundException)
      {
        return null;
      }
    }

    public Task<bool> DeleteAsync(Guid id)
    {
        return _tourRepository.DeleteAsync(id);
    }

    public async Task HandleBookingRequestAsync(BookingRequestedEvent bookingEvent)
    {
        _logger.LogInformation("Đang xử lý HandleBookingRequestAsync cho BookingId: {BookingId}", bookingEvent.BookingId);
        var departure = await _tourDepartureRepository.GetByIdAsync(bookingEvent.TourDepartureId);

        if (departure == null)
        {
            _logger.LogError("Không tìm thấy TourDepartureId: {DepartureId}. Gửi 'slots.failed'", bookingEvent.TourDepartureId);
            await _kafkaProducer.ProduceSlotsFailedAsync(new SlotsFailedEvent
            {
                BookingId = bookingEvent.BookingId,
                Reason = "Tour departure not found."
            });
            return;
        }
        int requestedSlots = bookingEvent.Participants.Count;
        if (departure.AvailableSlots >= requestedSlots)
        {
            departure.AvailableSlots -= requestedSlots;
            await _tourDepartureRepository.UpdateAsync(departure);
            
            _logger.LogInformation("Giữ chỗ thành công. Slot còn lại: {AvailableSlots}. Gửi 'slots.reserved'", departure.AvailableSlots);
            await _kafkaProducer.ProduceSlotsReservedAsync(new SlotsReservedEvent
            {
                BookingId = bookingEvent.BookingId,
                TourId = bookingEvent.TourId,
                DepartureId = bookingEvent.TourDepartureId,
                TotalPrice = bookingEvent.TotalPrice
            });
        }
        else
        {
             _logger.LogWarning("Không đủ chỗ. Yêu cầu: {RequestedSlots}, Chỉ còn: {AvailableSlots}. Gửi 'slots.failed'",
                requestedSlots, departure.AvailableSlots);
                
            await _kafkaProducer.ProduceSlotsFailedAsync(new SlotsFailedEvent
            {
                BookingId = bookingEvent.BookingId,
                Reason = "Not enough available slots."
            });
        }
    }

    public async Task HandleReleaseSlotsAsync(ReleaseSlotsEvent releaseEvent)
    {
        _logger.LogInformation("Đang xử lý HandleReleaseSlotsAsync cho BookingId: {BookingId}. Trả lại {Quantity} slot.", 
            releaseEvent.BookingId, releaseEvent.Quantity);
            
        var departure = await _tourDepartureRepository.GetByIdAsync(releaseEvent.DepartureId);

        if (departure != null)
        {
            // Cộng lại slot
            departure.AvailableSlots += releaseEvent.Quantity;
            await _tourDepartureRepository.UpdateAsync(departure);
            _logger.LogInformation("Đã trả slot thành công cho TourDepartureId: {DepartureId}. Slot mới: {AvailableSlots}",
                departure.Id, departure.AvailableSlots);
        }
        else
        {
            _logger.LogError("Không tìm thấy TourDepartureId: {DepartureId} để trả slot. Bỏ qua.", releaseEvent.DepartureId);
        }
    }
  }
}