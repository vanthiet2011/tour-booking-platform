using AutoMapper;
using TourService.Dtos;
using TourService.Entities;
using TourService.Events;
using TourService.Kafka.Producers;
using TourService.Models;
using TourService.Repositories;

namespace TourService.Services
{
  public class TourService : ITourService
  {
    private readonly ITourRepository _tourRepository;
    private readonly ITourDepartureRepository _tourDepartureRepository;
    private readonly ITourKafkaProducerService _kafkaProducer;
    private readonly ICachingService _cachingService;
    private readonly IMapper _mapper;
    private readonly ILogger<TourService> _logger;

    public TourService(
      ITourRepository tourRepository,
      IMapper mapper, ILogger<TourService> logger,
      ITourDepartureRepository tourDepartureRepository,
      ICachingService cachingService,
      ITourKafkaProducerService kafkaProducer)
    {
      _tourRepository = tourRepository;
      _mapper = mapper;
      _logger = logger;
      _cachingService = cachingService;
      _tourDepartureRepository = tourDepartureRepository;
      _kafkaProducer = kafkaProducer;
    }

    public async Task<PaginatedResponse<TourDetailDto>> GetAllToursAsync(
      int page, 
      int pageSize, 
      string? search = null)
    {
      string normalizedSearch = search?.Trim().ToLower() ?? "";
      string cacheKey = $"tours:{page}:{pageSize}:{normalizedSearch}";

      var cachedTours = await _cachingService.GetAsync<PaginatedResponse<TourDetailDto>>(cacheKey);
      if (cachedTours != null)
          return cachedTours;

      var toursFromDb = await _tourRepository.GetAllAsync(page, pageSize, search);
      var toursDto = _mapper.Map<PaginatedResponse<TourDetailDto>>(toursFromDb);

      await _cachingService.SetAsync(cacheKey, toursDto, TimeSpan.FromMinutes(10));
      return toursDto;
    }


    public async Task<TourDetailDto> GetTourByIdAsync(Guid id)
    {
      string cacheKey = string.Format(CacheKeys.TourById, id);

      var cachedTour = await _cachingService.GetAsync<TourDetailDto>(cacheKey);
      if (cachedTour != null) return cachedTour;

      var tourFromDb = await _tourRepository.GetByIdAsync(id);
      var tourDto = _mapper.Map<TourDetailDto>(tourFromDb);

      await _cachingService.SetAsync(cacheKey, tourDto, TimeSpan.FromHours(1));
      return tourDto;
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

    public async Task<TourDetailDto> CreateTourAsync(CreateTourDto createTourDto)
    {
      var tourEntity = _mapper.Map<TourEntity>(createTourDto);
      await _tourRepository.CreateAsync(tourEntity);

      await _cachingService.RemoveAsync(CacheKeys.TourPrefix);
      return _mapper.Map<TourDetailDto>(tourEntity);
    }
    
    public async Task<bool> UpdateTourAsync(Guid id, UpdateTourDto updateTourDto)
    {
      var tourEntity = await _tourRepository.GetByIdAsync(id);
      if (tourEntity == null) return false;

      _mapper.Map(updateTourDto, tourEntity);

      await _tourRepository.UpdateAsync(tourEntity);
      await _cachingService.RemoveAsync(CacheKeys.TourPrefix);

      return true;
    }

    public async Task<bool> DeleteTourAsync(Guid id)
    {
      var result = await _tourRepository.DeleteAsync(id);
      if (result) await _cachingService.RemoveAsync(CacheKeys.TourPrefix);
      return result;
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