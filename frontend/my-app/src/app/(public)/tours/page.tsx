"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TourCard } from "@/components/tours/TourCard";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import tourService from "@/services/tour.service";
import type { TourPagingResponse, Tour } from "@/types/tour";
import { TourFilters } from "@/components/tours/TourFilters";
import { Home, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

function ToursPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tourData, setTourData] = useState<TourPagingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(searchParams.toString());

        if (!params.has("pageSize")) params.set("pageSize", "9");

        const data = await tourService.getPaginatedTours(params);
        setTourData(data);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
        setError("Không thể tải danh sách tour. Vui lòng thử lại.");
        setTourData({
          items: [],
          pageNumber: 1,
          pageSize: 9,
          totalPages: 0,
          totalCount: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const tours = tourData?.items || [];
  const totalPages = tourData?.totalPages || 0;

  return (
    <main>
      {/* Header Banner */}
      <PageHeader
        title="Khám phá tất cả Tour"
        subtitle="Khám phá những hành trình đặc sắc và độc đáo được lựa chọn dành riêng cho bạn, mang lại trải nghiệm khó quên."
        badgeLabel="Tour du lịch"
        badgeIcon={MapPin}
        backgroundImage="/images/lake_header.jpg"
        breadcrumbItems={[
          { label: "Trang chủ", href: "/", icon: Home },
          { label: "Tour" },
        ]}
      />

      {/* Main Content */}
      <section className="py-6 md:py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="md:col-span-1 sticky top-24 h-fit">
              <TourFilters />
            </aside>

            {/* Tour Grid */}
            <section className="md:col-span-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p>Đang tìm kiếm chuyến đi tốt nhất...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              ) : tours.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tours.map((tour: Tour) => (
                      <TourCard key={tour.id} tour={tour} />
                    ))}
                  </div>

                  <div className="mt-12 flex justify-center">
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 w-full bg-muted/30 rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Rất tiếc, chúng tôi không tìm thấy tour nào phù hợp với bộ
                    lọc hiện tại. Hãy thử điều chỉnh khoảng giá hoặc từ khóa tìm
                    kiếm.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function AllToursPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-20 px-4 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      }
    >
      <ToursPageContent />
    </Suspense>
  );
}
