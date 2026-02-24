using AutoMapper;
using TourService.Dtos;
using TourService.Entities;
using TourService.Repositories;
using TourService.Services.External;

namespace TourService.Services;

public interface IReviewService
{
    Task<IEnumerable<ReviewResponseDto>> GetReviewsByTourIdAsync(Guid tourId);
    Task<ReviewResponseDto> AddReviewAsync(Guid userId, CreateReviewDto dto);
    Task<CheckEligibilityResponseDto> CheckEligibilityAsync(Guid userId, Guid tourId);
}

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IBookingsClient _bookingsClient;
    private readonly IMapper _mapper;

    public ReviewService(IReviewRepository reviewRepository, IBookingsClient bookingsClient, IMapper mapper)
    {
        _reviewRepository = reviewRepository;
        _bookingsClient = bookingsClient;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ReviewResponseDto>> GetReviewsByTourIdAsync(Guid tourId)
    {
        var reviews = await _reviewRepository.GetByTourIdAsync(tourId);
        // In a real app, we might fetch user details (name, avatar) from UserService here or store them in ReviewEntity.
        // For simplicity, we'll map what we have. If ReviewEntity stores UserId but not Name, the name will be null/empty unless we fetch it.
        // Assuming for now we want to keep it simple or update ReviewEntity to cache name.
        // Let's assume ReviewEntity has UserId and we might not have the name if we don't call UserService.
        // For this task, let's map what we can.
        return _mapper.Map<IEnumerable<ReviewResponseDto>>(reviews);
    }

    public async Task<ReviewResponseDto> AddReviewAsync(Guid userId, CreateReviewDto dto)
    {
        // 1. Check if user has already reviewed
        if (await _reviewRepository.HasUserReviewedAsync(userId, dto.TourId))
        {
            throw new InvalidOperationException("Bạn đã đánh giá tour này rồi.");
        }

        // 2. Check if user has completed booking
        var hasCompletedBooking = await _bookingsClient.CheckBookingCompletionAsync(userId, dto.TourId);
        if (!hasCompletedBooking)
        {
            throw new InvalidOperationException("Bạn chỉ có thể đánh giá sau khi hoàn thành tour.");
        }

        var review = new ReviewEntity
        {
            Id = Guid.NewGuid(),
            TourId = dto.TourId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepository.AddAsync(review);
        return _mapper.Map<ReviewResponseDto>(review);
    }

    public async Task<CheckEligibilityResponseDto> CheckEligibilityAsync(Guid userId, Guid tourId)
    {
        if (await _reviewRepository.HasUserReviewedAsync(userId, tourId))
        {
            return new CheckEligibilityResponseDto { CanReview = false, Message = "Bạn đã đánh giá tour này rồi." };
        }

        var hasCompletedBooking = await _bookingsClient.CheckBookingCompletionAsync(userId, tourId);
        if (!hasCompletedBooking)
        {
            return new CheckEligibilityResponseDto { CanReview = false, Message = "Bạn cần hoàn thành tour để đánh giá." };
        }

        return new CheckEligibilityResponseDto { CanReview = true };
    }
}
