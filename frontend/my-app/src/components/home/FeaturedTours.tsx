"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tour } from "@/types/tour";
import { TourCard } from "@/components/tours/TourCard";
import tourService from "@/services/tour.service";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function FeaturedTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("pageSize", "10");
        const paginatedResponse = await tourService.getPaginatedTours(params);
        setTours(paginatedResponse.items);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTours();
  }, []);

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

        <div className="relative px-4 md:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {tours.map((tour) => (
                <CarouselItem
                  key={tour.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/4"
                >
                  <div className="h-full w-full flex flex-col">
                    <TourCard tour={tour} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex -left-2 lg:-left-12 h-10 w-10 border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition" />
            <CarouselNext className="hidden md:flex -right-2 lg:-right-12 h-10 w-10 border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition" />
          </Carousel>
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
