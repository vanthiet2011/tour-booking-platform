// src/components/profile/MyBookingCard.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types/booking";
import { Tour } from "@/types/tour";
import tourService from "@/services/tour.service";
import Image from "next/image";
import {
  Calendar,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  CreditCard,
  FileText,
} from "lucide-react";

interface MyBookingCardProps {
  booking: Booking;
}

// Hàm helper để tạo màu cho Status Badge
const getStatusVariant = (
  status: string
): "destructive" | "secondary" | "default" | "outline" => {
  switch (status) {
    case "Confirmed":
      return "default"; // Màu xanh (hoặc "success" nếu bạn định nghĩa)
    case "Pending":
      return "outline"; // Màu vàng
    case "Completed":
      return "secondary"; // Màu xám
    case "Cancelled":
    case "Failed":
      return "destructive"; // Màu đỏ
    default:
      return "secondary";
  }
};

// Hàm helper để lấy icon cho Status
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Confirmed":
    case "Completed":
      return <CheckCircle className="h-4 w-4" />;
    case "Pending":
      return <AlertCircle className="h-4 w-4" />;
    case "Cancelled":
    case "Failed":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

export function MyBookingCard({ booking }: MyBookingCardProps) {
  const [tour, setTour] = useState<Tour | null>(null);

  // Giữ lại logic này vì BookingEntity chỉ có tourId
  useEffect(() => {
    if (booking.tourId) {
      tourService
        .getById(booking.tourId)
        .then((data) => setTour(data))
        .catch((err) =>
          console.error("Không thể tải thông tin tour cho booking card:", err)
        );
    }
  }, [booking.tourId]);

  const totalGuests =
    booking.bookingDetails?.reduce((acc, detail) => acc + detail.quantity, 0) ?? 0;

  return (
    <Card className="overflow-hidden shadow-md transition-all hover:shadow-lg">
      <div className="flex flex-col md:flex-row">
        {/* Hình ảnh Tour (Bên trái) */}
        <div className="relative h-48 w-full md:h-auto md:w-1/3 lg:w-1/4">
          {tour?.imageUrl ? (
            <Image
              src={tour.imageUrl}
              alt={tour.name}
              layout="fill"
              objectFit="cover"
              className="md:rounded-l-lg md:rounded-r-none"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
              Đang tải ảnh...
            </div>
          )}
        </div>

        {/* Thông tin Booking (Bên phải) */}
        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
          <div>
            {/* Hàng trên: Status và Tên Tour */}
            <div className="flex justify-between items-start mb-2">
              <Badge
                variant={getStatusVariant(booking.status)}
                className="w-fit"
              >
                {getStatusIcon(booking.status)}
                <span className="ml-1">{booking.status}</span>
              </Badge>
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold mb-2 hover:text-primary">
              <Link href={`/tours/${booking.tourId}`}>
                {tour?.name || "Đang tải tên tour..."}
              </Link>
            </h3>

            {/* Hàng thông tin chi tiết: Địa điểm, Ngày, Số khách */}
            <div className="space-y-2 text-muted-foreground text-sm">
              {tour?.destinations && tour.destinations.length > 0 && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{tour.destinations.map((d) => d.name).join(", ")}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Ngày đi:{" "}
                  {format(new Date(booking.startDate), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>{totalGuests} khách</span>
              </div>
            </div>
          </div>

          {/* Hàng dưới: Giá và Nút hành động */}
          <div className="border-t mt-4 pt-4 flex flex-col md:flex-row justify-between items-start md:items-end">
            <div className="mb-4 md:mb-0 w-full md:w-auto">
              <p className="text-sm text-muted-foreground mb-1">Tổng chi phí</p>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(booking.totalPrice)}
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {/* Giữ lại nút thanh toán quan trọng */}
              {booking.status === "Pending" && booking.paymentLink && (
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <a
                    href={booking.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Thanh toán ngay
                  </a>
                </Button>
              )}

              {/* Nút xem chi tiết (quan trọng hơn "Share") */}
              <Button variant="outline" asChild>
                <Link href={`/profile/my-bookings/${booking.id}`}>
                  <FileText className="w-4 h-4 mr-2" />
                  Xem chi tiết
                </Link>
              </Button>

              {/* (Nút Chevron có thể dùng để link tới trang chi tiết trên mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
                asChild
              >
                <Link href={`/profile/my-bookings/${booking.id}`}>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
