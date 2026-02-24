"use client";

import { useEffect, useState } from "react";
import { Tour } from "@/types/tour";
import tourService from "@/services/tour.service";
import { TourCard } from "./TourCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedToursProps {
  currentTourId: string;
}

export function RelatedTours({ currentTourId }: RelatedToursProps) {
  const [relatedTours, setRelatedTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedTours = async () => {
      try {
        const tours = await tourService.getRelatedTours(currentTourId);
        setRelatedTours(tours);
      } catch (error) {
        console.error("Failed to fetch related tours:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentTourId) {
      fetchRelatedTours();
    }
  }, [currentTourId]);

  if (!loading && relatedTours.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-12">
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
          Tour Tương Tự
        </h2>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Khám phá thêm các điểm đến hấp dẫn khác có thể bạn sẽ thích
        </p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
