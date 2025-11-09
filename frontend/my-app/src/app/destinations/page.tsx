"use client";

import { useState, useEffect } from "react";
import { Destination, Category } from "@/types/destination";
import destinationService from "@/services/destination.service";
import categoryService from "@/services/category.service"; // 1. Import
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { DestinationFilters } from "@/components/destinations/DestinationFilters";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { ChevronRight, Frown } from "lucide-react";
import Link from "next/link";

const ITEMS_PER_PAGE = 12;

const REGION_MAP: { [key: string]: string } = {
  bắc: "Miền Bắc",
  trung: "Miền Trung",
  nam: "Miền Nam",
};
export default function DestinationsPage() {
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<
    Destination[]
  >([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setFetchError(false);
      try {
        const [destData, catData] = await Promise.all([
          destinationService.getAll({ limit: 999 }),
          categoryService.getAll(),
        ]);

        setAllDestinations(destData.items);
        setFilteredDestinations(destData.items);
        setAllCategories(catData);
      } catch (error) {
        console.error("Không thể tải dữ liệu trang:", error);
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    let destinations = [...allDestinations];
    if (searchTerm) {
      destinations = destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (d.description &&
            d.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedRegions.length > 0) {
      const fullRegionNames = selectedRegions.map((key) => REGION_MAP[key]);
      destinations = destinations.filter(
        (d) => d.region && fullRegionNames.includes(d.region)
      );
    }

    if (selectedCategory !== "all") {
      destinations = destinations.filter((d) =>
        d.categories?.some((c) => c.id === selectedCategory)
      );
    }

    setFilteredDestinations(destinations);
    setCurrentPage(1);
  }, [searchTerm, selectedRegions, selectedCategory, allDestinations]);

  const totalItems = filteredDestinations.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedDestinations = filteredDestinations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center col-span-full text-muted-foreground">
          Đang tải điểm đến...
        </div>
      );
    }
    if (fetchError) {
      return (
        <div className="text-center col-span-full text-red-500">
          Lỗi: Không thể tải dữ liệu. Vui lòng thử lại sau.
        </div>
      );
    }
    if (paginatedDestinations.length === 0) {
      return (
        <div className="text-center col-span-full text-muted-foreground p-12 bg-muted/30 rounded-lg">
          <Frown className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg">
            Không tìm thấy điểm đến nào phù hợp với tiêu chí của bạn.
          </p>
        </div>
      );
    }
    return (
      <>
        {paginatedDestinations.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </>
    );
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

      <nav className="container mx-auto px-12 pt-6 text-base text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
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
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedRegions={selectedRegions}
                onRegionChange={setSelectedRegions}
                allCategories={allCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </aside>

            <main className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderContent()}
              </div>
              <div className="mt-12">
                <PaginationComponent
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </main>
          </div>
        </div>
      </section>
    </main>
  );
}
