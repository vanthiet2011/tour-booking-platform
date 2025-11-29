"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TourCard } from "@/components/tours/TourCard";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import tourService from "@/services/tour.service";
import type { TourPagingResponse, Tour } from "@/types/tour";
import { TourFilters } from "@/components/tours/TourFilters";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

function ToursPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tourData, setTourData] = useState<TourPagingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const debouncedSearch = useDebounce(searchTerm, 500);

  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (params.get("search") !== searchParams.get("search")) {
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(searchParams.toString());
        if (!params.get("search")) params.delete("search");

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

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const tours = tourData?.items || [];
  const totalPages = tourData?.totalPages || 0;

  return (
    <main>
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-12 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Khám phá tất cả Tour
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Khám phá những hành trình đặc sắc và độc đáo được lựa chọn dành
            riêng cho bạn.
          </p>
        </div>
      </section>

      <nav className="container mx-auto px-12 pt-6 text-base text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-semibold">Tour</span>
        </div>
      </nav>

      <section className="py-6 md:py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1 sticky top-24 h-fit">
              <TourFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            </aside>

            <section className="md:col-span-3">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Đang tải tour...
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
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
                <div className="flex items-center justify-center h-72 w-full bg-muted/50 rounded-lg p-16">
                  <p className="text-center text-muted-foreground">
                    Không tìm thấy tour nào phù hợp.
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
        <div className="container mx-auto py-12 px-4 md:px-0 text-center">
          Đang tải trang...
        </div>
      }
    >
      <ToursPageContent />
    </Suspense>
  );
}
