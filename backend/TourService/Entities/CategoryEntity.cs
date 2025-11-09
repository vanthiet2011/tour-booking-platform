// File: TourService/Entities/CategoryEntity.cs (TẠO MỚI)
using System;
using System.Collections.Generic;

namespace TourService.Entities
{
    public class CategoryEntity
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public ICollection<DestinationCategoryEntity> DestinationCategories { get; set; } = new List<DestinationCategoryEntity>();
    }
}