using TourService.Entities;

namespace TourService.Repositories;

public interface IReviewRepository
{
    Task<ReviewEntity> AddAsync(ReviewEntity review);
    Task<IEnumerable<ReviewEntity>> GetByTourIdAsync(Guid tourId);
    Task<bool> HasUserReviewedAsync(Guid userId, Guid tourId);
    Task<double> GetAverageRatingAsync(Guid tourId);
    Task<int> GetReviewCountAsync(Guid tourId);
}
