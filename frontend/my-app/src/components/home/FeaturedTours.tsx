// src/components/tours/FeaturedTours.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tour } from "@/types/tour";
import { TourCard } from "@/components/tours/TourCard";
import { ArrowRight } from "lucide-react";
import tourService from "@/services/tour.service";

export function FeaturedTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      setIsLoading(true);
      try {
        const allTours = await tourService.getAll();
        setTours(allTours.slice(0, 8)); // Lấy 8 tour đầu tiên làm "nổi bật"
      } catch (error) {
        console.error("Lỗi khi tải tour nổi bật:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTours();
  }, []);

  // 🕒 Trạng thái tải dữ liệu
  if (isLoading) {
    return (
      <section className="py-8 bg-muted/40 text-center">
        <div className="container px-4 md:px-6 lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Các tour nổi bật
          </h2>
          <p className="text-lg text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </section>
    );
  }

  // ❌ Khi không có tour
  if (tours.length === 0) {
    return (
      <section className="py-8 bg-muted/40 text-center">
        <div className="container px-4 md:px-6 lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Các tour nổi bật
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Những chuyến đi được khách hàng yêu thích và đặt nhiều nhất.
          </p>
          <p className="text-muted-foreground">
            Hiện chưa có tour nào để hiển thị.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-muted/40">
      <div className="container px-4 md:px-6 lg:px-8">
        {/* Tiêu đề Section */}
        <div className="text-center mb-12">
          <span className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-3">
            Tours phổ biến
          </span>
          <h2 className="text-4xl font-bold mb-4">
            Các Chuyến Đi Được <span className="text-primary">Yêu Thích</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Những chuyến đi được khách hàng yêu thích và đặt nhiều nhất.
          </p>
        </div>

        {/* Lưới các Tour */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/tours">
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition">
              Xem Tất Cả Tours →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
