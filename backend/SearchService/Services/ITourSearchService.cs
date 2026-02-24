using SearchService.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SearchService.Services
{
    public interface ITourSearchService
    {
        Task IndexTourAsync(TourDocument tour);
        Task DeleteTourAsync(Guid id);
        Task<IEnumerable<TourDocument>> GetRelatedToursAsync(Guid tourId);
    }
}
