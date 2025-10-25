// src/app/destinations/[id]/page.tsx
import tourService from "@/services/tour.service";
import destinationService from "@/services/destination.service";
import type { Tour } from "@/types/tour";
import type { Destination } from "@/types/destination";
import { TourCard } from "@/components/TourCard";
import { TourFilters } from "@/components/TourFilters";

interface DestinationToursPageProps {
  params: { id: string };
}

export default async function DestinationToursPage({
  params,
}: DestinationToursPageProps) {
  const { id } = await params;

  const [tours, destination] = await Promise.all([
    tourService.getToursByDestination(id) as Promise<Tour[]>,
    (destinationService.getById(id) as Promise<Destination>) || null,
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 pt-24 md:pt-28">
      {/* Bố cục chính chia 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Cột trái: Bộ lọc */}
        <aside className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg p-6 sticky top-24">
            <TourFilters />
          </div>
        </aside>

        {/* Cột phải: Tiêu đề + danh sách tour */}
        <section className="lg:col-span-3">
          {/* Tiêu đề */}
          <div className="mb-8">
            <h1 className="text-xl md:text-2xl font-bold">
              Du lịch
              <span className="text-primary ml-2">
                {destination ? destination.name : "..."}
              </span>
            </h1>
          </div>

          {/* Danh sách TourCard */}
          {tours && tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-72 w-full bg-muted/50 rounded-lg p-16">
              <p className="text-center text-muted-foreground">
                Không tìm thấy tour nào cho điểm đến này.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
