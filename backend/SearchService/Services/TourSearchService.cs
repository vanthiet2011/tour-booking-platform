using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.QueryDsl;
using SearchService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SearchService.Services
{
    public class TourSearchService : ITourSearchService
    {
        private readonly ElasticsearchClient _client;
        private const string IndexName = "tours";

        public TourSearchService(ElasticsearchClient client)
        {
            _client = client;
        }

        public async Task IndexTourAsync(TourDocument tour)
        {
            var response = await _client.IndexAsync(tour, idx => idx.Index(IndexName));
            if (!response.IsValidResponse)
            {
                // Log error or handle failure
                Console.WriteLine($"Failed to index tour: {response.DebugInformation}");
            }
        }

        public async Task DeleteTourAsync(Guid id)
        {
            var response = await _client.DeleteAsync<TourDocument>(id, idx => idx.Index(IndexName));
            if (!response.IsValidResponse)
            {
                Console.WriteLine($"Failed to delete tour: {response.DebugInformation}");
            }
        }

        public async Task<IEnumerable<TourDocument>> GetRelatedToursAsync(Guid tourId)
        {
            // More Like This Query
            var response = await _client.SearchAsync<TourDocument>(s => s
                .Indices(IndexName)
                .Query(q => q
                    .MoreLikeThis(m => m
                        .Like(new List<Like> { new Like(new LikeDocument { Id = tourId.ToString(), Index = IndexName }) })
                        .Fields(new[] { "name", "description", "tags", "region", "destinations" })
                        .MinTermFreq(1)
                        .MinDocFreq(1)
                    )
                )
                .Size(4) 
            );

            if (!response.IsValidResponse)
            {
                Console.WriteLine($"Failed to search related tours: {response.DebugInformation}");
                return Enumerable.Empty<TourDocument>();
            }

            return response.Documents;
        }
    }
}
