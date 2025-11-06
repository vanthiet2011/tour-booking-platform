// src/app/destinations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Destination } from "@/types/destination";
import destinationService from "@/services/destination.service";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { DestinationFilters } from "@/components/destinations/DestinationFilters";
import { ChevronRight, Frown } from "lucide-react";
import Link from "next/link";

// Định nghĩa từ khóa cho logic lọc "tạm thời"
const REGION_KEYWORDS: { [key: string]: string[] } = {
  bắc: [
    "bắc",
    "hà nội",
    "sapa",
    "hạ long",
    "ninh bình",
    "mù cang chải",
    "hà giang",
  ],
  trung: [
    "trung",
    "huế",
    "hội an",
    "đà nẵng",
    "phong nha",
    "quy nhơn",
    "nha trang",
  ],
  nam: [
    "nam",
    "sài gòn",
    "hồ chí minh",
    "mekong",
    "phú quốc",
    "cần thơ",
    "vũng tàu",
  ],
};

export default function DestinationsPage() {
  // State
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<
    Destination[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  // Đổi tên state
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // 1. Fetch dữ liệu (giữ nguyên)
  useEffect(() => {
    const fetchDestinations = async () => {
      setIsLoading(true);
      setFetchError(false);
      try {
        const data = await destinationService.getAll();
        setAllDestinations(data);
        setFilteredDestinations(data);
      } catch (error) {
        console.error("Không thể tải danh sách điểm đến:", error);
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  // 2. Lọc dữ liệu (CẬP NHẬT LOGIC LỌC)
  useEffect(() => {
    let destinations = [...allDestinations];

    // Lọc theo Search Term (giữ nguyên)
    if (searchTerm) {
      destinations = destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.description!.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo Miền (logic mới)
    if (selectedRegions.length > 0) {
      destinations = destinations.filter((d) => {
        const content = (d.name + " " + d.description).toLowerCase();
        // Kiểm tra xem content có chứa BẤT KỲ từ khóa nào
        // trong CÁC MIỀN đã chọn không
        return selectedRegions.some((regionId) =>
          REGION_KEYWORDS[regionId]?.some((keyword) =>
            content.includes(keyword)
          )
        );
      });
    }

    setFilteredDestinations(destinations);
  }, [searchTerm, selectedRegions, allDestinations]);

  // Hàm render nội dung chính (giữ nguyên)
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
    if (filteredDestinations.length === 0) {
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
        {filteredDestinations.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </>
    );
  };

  return (
    <main>
      {/* 1. Hero Section (giữ nguyên) */}
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

      <nav className="container mx-auto px-12 pt-6 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-semibold">Điểm đến</span>
        </div>
      </nav>

      {/* 2. Phần nội dung 2 cột (Lọc + Kết quả) */}
      <section className="py-6 md:py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* CỘT TRÁI: BỘ LỌC */}
            <aside className="md:col-span-1">
              {/* Cập nhật props */}
              <DestinationFilters
                onSearchChange={setSearchTerm}
                onRegionChange={setSelectedRegions}
              />
            </aside>

            {/* CỘT PHẢI: LƯỚI KẾT QUẢ (giữ nguyên) */}
            <main className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </section>
    </main>
  );
}
