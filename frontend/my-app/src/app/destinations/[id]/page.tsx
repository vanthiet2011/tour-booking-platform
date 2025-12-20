import Link from "next/link";
import { notFound } from "next/navigation";
import tourService from "@/services/tour.service";
import destinationService from "@/services/destination.service";
import { TourCard } from "@/components/tours/TourCard";
import { TourFilters } from "@/components/tours/TourFilters";
import { TourPagination } from "@/components/tours/TourPagination";
import { ChevronRight, Home, MapPin } from "lucide-react"; // Import icon

interface DestinationPageProps {
  params: { id: string };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function DestinationDetailPage({
  params,
  searchParams,
}: DestinationPageProps) {
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
      {/* --- PHẦN 1: HERO BANNER & BREADCRUMB --- */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{
            backgroundImage: `url(${
              destination.imageUrl || "/placeholder-destination.jpg"
            })`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Nội dung Banner */}
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-12">
          {/* Tiêu đề lớn */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            {destination.name}
          </h1>

          {/* Mô tả */}
          <p className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed drop-shadow-md flex items-start gap-2">
            <MapPin className="w-6 h-6 mt-1 shrink-0 text-primary" />
            {destination.description ||
              `Khám phá vẻ đẹp tuyệt vời và các tour du lịch hấp dẫn tại ${destination.name}.`}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="container mx-auto px-6 pt-6 text-base text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" /> Trang chủ
          </Link>

          <ChevronRight className="w-4 h-4" />

          <Link
            href="/destinations"
            className="hover:text-primary transition-colors"
          >
            Điểm đến
          </Link>

          <ChevronRight className="w-4 h-4" />

          <span className="text-foreground font-semibold truncate">
            {destination.name}
          </span>
        </div>
      </nav>

      {/* --- PHẦN 2: NỘI DUNG CHÍNH --- */}
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

          {/* DANH SÁCH TOUR */}
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
