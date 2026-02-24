using Microsoft.EntityFrameworkCore;
using TourService.Data;
using TourService.Entities;

namespace TourService.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly TourDbContext _context;

    public ReviewRepository(TourDbContext context)
    {
        _context = context;
    }

    public async Task<ReviewEntity> AddAsync(ReviewEntity review)
    {
        await _context.Reviews.AddAsync(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<IEnumerable<ReviewEntity>> GetByTourIdAsync(Guid tourId)
    {
        return await _context.Reviews
            .Where(r => r.TourId == tourId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> HasUserReviewedAsync(Guid userId, Guid tourId)
    {
        return await _context.Reviews
            .AnyAsync(r => r.UserId == userId && r.TourId == tourId);
    }

    public async Task<double> GetAverageRatingAsync(Guid tourId)
    {
        var ratings = await _context.Reviews
            .Where(r => r.TourId == tourId)
            .Select(r => r.Rating)
            .ToListAsync();

        if (!ratings.Any()) return 0;
        return ratings.Average();
    }

    public async Task<int> GetReviewCountAsync(Guid tourId)
    {
        return await _context.Reviews
            .CountAsync(r => r.TourId == tourId);
    }
}
