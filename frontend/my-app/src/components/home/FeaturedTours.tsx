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
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function FeaturedTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("pageSize", "8");
        const paginatedResponse = await tourService.getPaginatedTours(params);
        let items = paginatedResponse.items;
        // Ensure enough items for scrolling (at least 16 to support infinite loop comfortably on large screens)
        if (items.length > 0 && items.length < 16) {
          while (items.length < 16) {
            items = [...items, ...items];
          }
        }
        // No need to slice to 8 anymore, keep them all to allow scrolling
        setTours(items);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTours();
  }, []);

  if (isLoading) {
    return (
      <section className="py-8 bg-muted/40 font-sans">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-4 w-32 mx-auto mb-3" />
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
        </div>

        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
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
    <section className="py-8 bg-muted/40 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto px-4 md:px-6 lg:px-8"
      >
        <div className="text-center mb-12">
          <span className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-3">
            Tours phổ biến
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Các Chuyến Đi Được <span className="text-primary">Yêu Thích</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Những chuyến đi được khách hàng yêu thích và đặt nhiều nhất.
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full px-6 md:px-12 lg:px-16"
      >
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {tours.map((tour, index) => (
              <CarouselItem
                key={`${tour.id}-${index}`}
                className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="h-full w-full flex flex-col">
                  <TourCard tour={tour} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex left-4 h-10 w-10 border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition" />
          <CarouselNext className="hidden md:flex right-4 h-10 w-10 border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition" />
        </Carousel>
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
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
