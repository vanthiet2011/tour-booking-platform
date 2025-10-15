// src/components/tours/TourCard.tsx

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Flame } from "lucide-react";
import { Tour } from "@/lib/api";
import { Button } from "@/components/ui/button";

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
    tour.tourDestinations
      ?.slice(0, 3)
      .map((td) => td.destination.name)
      .join(" – ") || "Nhiều điểm đến";
  const totalAvailableSlots =
    tour.tourDepartures?.reduce(
      (sum, departure) => sum + departure.availableSlots,
      0
    ) || 0;

  return (
    <Card className="group w-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
      <Link href={`/tours/${tour.id}`} passHref className="block">
        <div className="relative h-40 w-full">
          <Image
            src={tour.imageUrl || "/placeholder.svg"}
            alt={tour.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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

      {/* 🚀 1. Giảm padding tổng thể từ p-4 thành p-3 */}
      <CardContent className="py-2 px-4 flex flex-col flex-grow gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <p className="truncate font-medium">{displayDestinations}</p>
        </div>

        <h3 className="text-sm font-semibold text-foreground line-clamp-2">
          {tour.name}
        </h3>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{tour.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Còn {totalAvailableSlots} chỗ</span>
          </div>
        </div>

        <div className="mt-2 border-t pt-1 flex items-center justify-between">
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
  );
}
