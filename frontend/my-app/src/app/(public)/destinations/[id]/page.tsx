import Link from "next/link";
import { notFound } from "next/navigation";
import tourService from "@/services/tour.service";
import destinationService from "@/services/destination.service";
import { TourCard } from "@/components/tours/TourCard";
import { TourFilters } from "@/components/tours/TourFilters";
import { TourPagination } from "@/components/tours/TourPagination";
import { ChevronRight, Home, MapPin, Ticket } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DestinationDetailPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const destinationId = params.id;

  let destination;
  try {
    destination = await destinationService.getById(destinationId);
  } catch {
    notFound();
  }

  const apiParams = new URLSearchParams();
  if (searchParams.page) apiParams.set("page", searchParams.page as string);
  if (searchParams.search)
    apiParams.set("search", searchParams.search as string);
  if (searchParams.minPrice)
    apiParams.set("minPrice", searchParams.minPrice as string);
  if (searchParams.maxPrice)
    apiParams.set("maxPrice", searchParams.maxPrice as string);
  if (searchParams.minDurationDays)
    apiParams.set("minDurationDays", searchParams.minDurationDays as string);
  if (searchParams.maxDurationDays)
    apiParams.set("maxDurationDays", searchParams.maxDurationDays as string);

  apiParams.set("destinationId", destinationId);

  const tourData = await tourService.getPaginatedTours(apiParams);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PageHeader
        title={destination.name}
        subtitle={
          destination.description ||
          `Khám phá vẻ đẹp tuyệt vời và các tour du lịch hấp dẫn tại ${destination.name}.`
        }
        badgeLabel="Điểm đến"
        badgeIcon={MapPin}
        backgroundImage="/images/lake_header.jpg"
        breadcrumbItems={[
          { label: "Trang chủ", href: "/", icon: Home },
          { label: "Điểm đến", href: "/destinations" },
          { label: destination.name },
        ]}
      />

      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 h-fit sticky top-24 space-y-6">
            <aside className="md:col-span-1 sticky top-24 h-fit">
              <TourFilters
                hideRegion={true}
                className="border-0 shadow-none p-0"
              />
            </aside>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                Danh sách Tour ({tourData.totalCount})
              </h2>
            </div>

            {tourData.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tourData.items.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-xl bg-white text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chưa tìm thấy tour phù hợp
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Hiện tại chưa có tour nào tại{" "}
                  <strong>{destination.name}</strong> khớp với bộ lọc của bạn.
                  Hãy thử thay đổi ngân sách hoặc thời lượng xem sao nhé!
                </p>
              </div>
            )}

            <div className="flex justify-center mt-12">
              <TourPagination
                totalPages={tourData.totalPages}
                currentPage={tourData.pageNumber}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
