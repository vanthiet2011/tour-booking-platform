using AutoMapper;
using TourService.Dtos;
using TourService.Entities;
using TourService.Events;
using TourService.Kafka.Producers;
using TourService.Models;
using TourService.Repositories;
using TourService.Constants;

namespace TourService.Services
{
  public class TourService : ITourService
  {
    private readonly ITourRepository _tourRepository;
    private readonly IDestinationRepository _destinationRepository;
    private readonly ITourDepartureRepository _tourDepartureRepository;
    private readonly ITourKafkaProducerService _kafkaProducer;
    private readonly ICachingService _cachingService;
    private readonly IMapper _mapper;
    private readonly ILogger<TourService> _logger;

    public TourService(
      ITourRepository tourRepository,
      IDestinationRepository destinationRepository,
      IMapper mapper, ILogger<TourService> logger,
      ITourDepartureRepository tourDepartureRepository,
      ICachingService cachingService,
      ITourKafkaProducerService kafkaProducer)
    {
      _tourRepository = tourRepository;
      _destinationRepository = destinationRepository;
      _mapper = mapper;
      _logger = logger;
      _cachingService = cachingService;
      _tourDepartureRepository = tourDepartureRepository;
      _kafkaProducer = kafkaProducer;
    }

    public async Task<PaginatedResponse<TourListDto>> GetAllToursAsync(
      int page, 
      int pageSize, 
      string? search = null,
      decimal? minPrice = null,
      decimal? maxPrice = null,
      int ? minDurationDays = null,
      int ? maxDurationDays = null,
      string? region = null,
      Guid? destinationId = null)
    {
      string cacheKey = CacheKeys.GetTourListKey(page, pageSize, search, minPrice, maxPrice, minDurationDays, maxDurationDays, region, destinationId);

      try {
          var cachedTours = await _cachingService.GetAsync<PaginatedResponse<TourListDto>>(cacheKey);
          if (cachedTours != null) return cachedTours;
      } catch (Exception ex) {
          _logger.LogError(ex, "Redis connection failed while fetching tours list");
      }

      var toursFromDb = await _tourRepository.GetAllAsync(
        page, pageSize, search, minPrice, maxPrice,minDurationDays,maxDurationDays,region, destinationId);
      var toursDto = _mapper.Map<PaginatedResponse<TourListDto>>(toursFromDb);

      await _cachingService.SetAsync(cacheKey, toursDto, TimeSpan.FromMinutes(10));
      return toursDto;
    }


    public async Task<TourDetailDto> GetTourByIdAsync(Guid id)
    {
      string cacheKey = CacheKeys.GetTourByIdKey(id);

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

    public async Task<Dictionary<Guid, string>> GetTourNamesByIdsAsync(List<Guid> ids)
    {
      return await _tourRepository.GetNamesByIdsAsync(ids);
    }

    public async Task<TourDetailDto> CreateTourAsync(CreateTourDto createTourDto)
    {
      var tourEntity = _mapper.Map<TourEntity>(createTourDto);
      await _tourRepository.CreateAsync(tourEntity);

      string region = "Không xác định";
      try 
      {
          var firstDestinationId = tourEntity.TourDestinations?.FirstOrDefault()?.DestinationId;
          if (firstDestinationId.HasValue)
          {
              var destination = await _destinationRepository.GetByIdAsync(firstDestinationId.Value);
              if (destination != null) region = destination.Region?.ToString() ?? "Không xác định";
          }
      }
      catch (Exception ex)
      {
          _logger.LogWarning(ex, "Không thể lấy thông tin vùng miền cho Tour {Id}", tourEntity.Id);
      }

      await _cachingService.InvalidateTourCacheAsync(tourEntity.Id);

      try
      {
        var tourCreatedEvent = new TourCreatedEvent
        {
            TourId = tourEntity.Id,
            Name = tourEntity.Name,
            Description = tourEntity.Description ?? string.Empty,
            Region = region,
            Price = tourEntity.PricePerAdult,
            Duration = tourEntity.Duration ?? string.Empty,
            ImageUrl = tourEntity.ImageUrl ?? string.Empty,
            AvailableSlots = tourEntity.TourDepartures?.Sum(d => d.AvailableSlots) ?? 0,
            Destinations = tourEntity.TourDestinations?.Select(td => td.Destination?.Name).Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string>(),
            Tags = tourEntity.Highlights ?? new List<string>(),
            CreatedAt = DateTime.UtcNow
        };
        await _kafkaProducer.ProduceTourCreatedAsync(tourCreatedEvent);
        _logger.LogInformation("Sự kiện TourCreatedEvent đã được gửi thành công. TourId: {Id}", tourEntity.Id);
      }
      catch (Exception ex) 
      {
          _logger.LogError(ex, "Không thể gửi sự kiện tour-created lên Kafka");
      }
      return _mapper.Map<TourDetailDto>(tourEntity);
    }
    
    public async Task<bool> UpdateTourAsync(Guid id, UpdateTourDto updateTourDto)
    {
      var tourEntity = await _tourRepository.GetByIdAsync(id);
      if (tourEntity == null) return false;

      _mapper.Map(updateTourDto, tourEntity);

      await _tourRepository.UpdateAsync(tourEntity);
      await _cachingService.InvalidateTourCacheAsync(id);

      // Get Region again if necessary
      string region = "Không xác định";
      try 
      {
          var firstDestinationId = tourEntity.TourDestinations?.FirstOrDefault()?.DestinationId;
          if (firstDestinationId.HasValue)
          {
              var destination = await _destinationRepository.GetByIdAsync(firstDestinationId.Value);
              if (destination != null) region = destination.Region?.ToString() ?? "Không xác định";
          }
      }
      catch (Exception ex)
      {
           _logger.LogWarning(ex, "Không thể lấy thông tin vùng miền cho Tour {Id}", tourEntity.Id);
      }

      try
      {
          var tourUpdatedEvent = new TourUpdatedEvent
          {
              TourId = tourEntity.Id,
              Name = tourEntity.Name,
              Description = tourEntity.Description ?? string.Empty,
              Region = region,
              Price = tourEntity.PricePerAdult,
              Duration = tourEntity.Duration ?? string.Empty,
              ImageUrl = tourEntity.ImageUrl ?? string.Empty,
              AvailableSlots = tourEntity.TourDepartures?.Sum(d => d.AvailableSlots) ?? 0,
              Destinations = tourEntity.TourDestinations?.Select(td => td.Destination?.Name).Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string>(),
              Tags = tourEntity.Highlights ?? new List<string>(),
              UpdatedAt = DateTime.UtcNow
          };
          await _kafkaProducer.ProduceTourUpdatedAsync(tourUpdatedEvent);
          _logger.LogInformation("Sự kiện TourUpdatedEvent đã được gửi thành công. TourId: {Id}", tourEntity.Id);
      }
      catch (Exception ex)
      {
          _logger.LogError(ex, "Không thể gửi sự kiện tour-updated lên Kafka");
      }

      return true;
    }

    public async Task<bool> DeleteTourAsync(Guid id)
    {
      var result = await _tourRepository.DeleteAsync(id);
      if (result) 
      {
          await _cachingService.InvalidateTourCacheAsync(id);
          try
          {
              var tourDeletedEvent = new TourDeletedEvent
              {
                  TourId = id,
                  DeletedAt = DateTime.UtcNow
              };
              await _kafkaProducer.ProduceTourDeletedAsync(tourDeletedEvent);
              _logger.LogInformation("Sự kiện TourDeletedEvent đã được gửi thành công. TourId: {Id}", id);
          }
          catch (Exception ex)
          {
              _logger.LogError(ex, "Không thể gửi sự kiện tour-deleted lên Kafka");
          }
      }
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
        int requestedSlots = bookingEvent.Participants.Sum(p => p.Quantity);
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
                TotalPrice = bookingEvent.TotalPrice,
                PaymentMethod = bookingEvent.PaymentMethod,
                IpAddress = bookingEvent.IpAddress
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

    public async Task SyncAllToursAsync()
    {
        _logger.LogInformation("Bắt đầu đồng bộ tất cả tours sang SearchService...");
        var allTours = await _tourRepository.GetAllAsync(1, 10000); // Lấy tất cả (hoặc phân trang nếu cần)
        
        foreach (var tourEntity in allTours.Items) // Giả sử GetAllAsync trả về PaginatedResponse
        {
            try 
            {
               string region = "Không xác định";
               var firstDestinationId = tourEntity.TourDestinations?.FirstOrDefault()?.DestinationId;
               if (firstDestinationId.HasValue)
               {
                   var destination = await _destinationRepository.GetByIdAsync(firstDestinationId.Value);
                   if (destination != null) region = destination.Region?.ToString() ?? "Không xác định";
               }

               var tourCreatedEvent = new TourCreatedEvent
               {
                   TourId = tourEntity.Id,
                   Name = tourEntity.Name,
                   Description = tourEntity.Description ?? string.Empty,
                   Region = region,
                   Price = tourEntity.PricePerAdult,
                   Duration = tourEntity.Duration ?? string.Empty,
                   ImageUrl = tourEntity.ImageUrl ?? string.Empty,
                   AvailableSlots = tourEntity.TourDepartures?.Sum(d => d.AvailableSlots) ?? 0,
                   Destinations = tourEntity.TourDestinations?.Select(td => td.Destination?.Name).Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string>(),
                   Tags = tourEntity.Highlights ?? new List<string>(),
                   CreatedAt = DateTime.UtcNow
               };
               await _kafkaProducer.ProduceTourCreatedAsync(tourCreatedEvent);
               _logger.LogInformation("Đã gửi sự kiện sync (created) cho TourId: {Id}", tourEntity.Id);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi sync tour {Id}", tourEntity.Id);
            }
        }
        _logger.LogInformation("Hoàn tất đồng bộ tours.");
    }
  }
}