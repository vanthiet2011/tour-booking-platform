"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Destination, Category } from "@/types/destination";
import destinationService from "@/services/destination.service";
import categoryService from "@/services/category.service";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { DestinationFilters } from "@/components/destinations/DestinationFilters";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { ChevronRight, Frown, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

const ITEMS_PER_PAGE = 12;

export default function DestinationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localSearch, setLocalSearch] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(localSearch, 500);

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchTermFromUrl = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("categoryId") || "all";
  const regionParam = searchParams.get("region") || "";
  const selectedRegions = regionParam ? regionParam.split(",") : [];

  const updateUrl = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (!newParams.page) {
        params.set("page", "1");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const handleSearchChange = (term: string) => updateUrl({ search: term });
  const handleCategoryChange = (catId: string) =>
    updateUrl({ categoryId: catId });
  const handleRegionChange = (regions: string[]) =>
    updateUrl({ region: regions.length > 0 ? regions.join(",") : null });
  const handlePageChange = (page: number) =>
    updateUrl({ page: page.toString() });

  useEffect(() => {
    if (debouncedSearch !== searchTermFromUrl) {
      updateUrl({ search: debouncedSearch });
    }
  }, [debouncedSearch, updateUrl, searchTermFromUrl]);

  useEffect(() => {
    setLocalSearch(searchTermFromUrl);
  }, [searchTermFromUrl]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await destinationService.getAll({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          search: searchTermFromUrl || undefined,
          region: regionParam || undefined,
          categoryId: selectedCategory === "all" ? undefined : selectedCategory,
        });

        setDestinations(response.items);
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error("Lỗi khi tải điểm đến:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    searchParams,
    currentPage,
    searchTermFromUrl,
    regionParam,
    selectedCategory,
  ]);

  // Load danh mục 1 lần duy nhất
  useEffect(() => {
    categoryService.getAll().then(setAllCategories).catch(console.error);
  }, []);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // --- 6. LOGIC RENDER ---
  const renderGridContent = () => {
    if (isLoading) {
      return (
        <div className="text-center col-span-full py-20">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">
            Đang tìm kiếm điểm đến...
          </p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center col-span-full py-20 text-red-500">
          Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.
        </div>
      );
    }

    if (destinations.length === 0) {
      return (
        <div className="text-center col-span-full py-20 bg-muted/20 rounded-xl border-2 border-dashed">
          <Frown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl font-semibold">Không tìm thấy kết quả</p>
          <p className="text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
          </p>
        </div>
      );
    }

    return destinations.map((dest) => (
      <DestinationCard key={dest.id} destination={dest} />
    ));
  };

  return (
    <main>
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-12 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Khám phá mọi điểm đến
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Từ những ngọn núi hùng vĩ đến những bãi biển nhiệt đới, hãy tìm
            nguồn cảm hứng cho chuyến đi tiếp theo của bạn.
          </p>
        </div>
      </section>

      <nav className="container mx-auto px-6 pt-6 text-base text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" /> Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-semibold">Điểm đến</span>
        </div>
      </nav>

      <section className="py-6 md:py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1 sticky top-24 h-fit">
              <DestinationFilters
                searchTerm={localSearch}
                onSearchChange={handleSearchChange}
                selectedRegions={selectedRegions}
                onRegionChange={handleRegionChange}
                allCategories={allCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </aside>

            <main className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderGridContent()}
              </div>
              <div className="mt-12">
                <PaginationComponent
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </main>
          </div>
        </div>
      </section>
    </main>
  );
}
