// src/components/tours/TourCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Flame } from "lucide-react";
import { Tour } from "@/types/tour";
import { Button } from "@/components/ui/button";
import { getFullImageUrl } from "@/lib/utils";
import { motion } from "framer-motion";

interface TourCardProps {
  tour: Tour;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function TourCard({ tour }: TourCardProps) {
  const displayDestinations =
    tour.destinations
      ?.slice(0, 3)
      .map((td) => td.name)
      .join(" – ") || "Nhiều điểm đến";

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="group w-full h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
        <Link href={`/tours/${tour.id}`} passHref className="block">
          {/* Fix chiều cao ảnh bằng aspect ratio */}
          <div className="relative w-full aspect-[16/10]">
            <Image
              src={getFullImageUrl(tour.imageUrl)}
              alt={tour.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {tour.isBestseller && (
              <Badge
                variant="destructive"
                className="absolute top-3 right-3 flex items-center gap-1"
              >
                <Flame className="h-4 w-4" /> Bán chạy
              </Badge>
            )}
          </div>
        </Link>

        <CardContent className=" px-4 flex flex-col flex-grow gap-3">
          {/* Địa điểm */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <p className="truncate font-medium">{displayDestinations}</p>
          </div>

          {/* Tiêu đề*/}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 min-h-[40px]">
            {tour.name}
          </h3>

          {/* Khoảng cách và slot */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{tour.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Còn {tour.availableSlots} chỗ</span>
            </div>
          </div>

          {/* Phần giá & nút */}
          <div className="mt-auto border-t pt-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Giá chỉ từ</p>
              <p className="text-base font-bold text-primary">
                {formatCurrency(tour.pricePerAdult)}
              </p>
            </div>

            <Link href={`/tours/${tour.id}`} passHref>
              <Button size="sm">Xem chi tiết</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
