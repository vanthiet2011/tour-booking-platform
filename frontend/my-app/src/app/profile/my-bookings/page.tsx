"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import bookingService from "@/services/booking.service";
import { Booking } from "@/types/booking";
import { MyBookingCard } from "@/components/profile/MyBookingCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Frown } from "lucide-react";

export default function MyBookingsPage() {
  const { isLoading: isAuthLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!isAuthLoading && token) {
      setIsLoading(true);
      bookingService
        .getMyBookings({ token } as any)
        .then((response) => {
          setBookings(response);
          setError(null);
        })
        .catch(() => {
          setError("Không thể tải danh sách tour đã đặt. Vui lòng thử lại.");
        })
        .finally(() => setIsLoading(false));
    } else if (!isAuthLoading && !token) {
      setIsLoading(false);
      setError("Bạn cần đăng nhập để xem thông tin này.");
    }
  }, [isAuthLoading]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-12">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : filterStatus === "upcoming"
      ? bookings.filter(
          (b) => b.status === "Pending" || b.status === "Confirmed"
        )
      : filterStatus === "completed"
      ? bookings.filter((b) => b.status === "Completed")
      : bookings.filter(
          (b) => b.status === "Cancelled" || b.status === "Failed"
        );

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-4xl font-bold mb-2">
            Các tour đã đặt
          </h1>
          <p className="text-lg text-muted-foreground">
            Quản lý và xem chi tiết các tour của bạn
          </p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            className="rounded-full"
          >
            Tất cả
          </Button>
          <Button
            variant={filterStatus === "upcoming" ? "default" : "outline"}
            onClick={() => setFilterStatus("upcoming")}
            className="rounded-full"
          >
            Sắp diễn ra
          </Button>
          <Button
            variant={filterStatus === "completed" ? "default" : "outline"}
            onClick={() => setFilterStatus("completed")}
            className="rounded-full"
          >
            Đã hoàn thành
          </Button>
          <Button
            variant={filterStatus === "cancelled" ? "default" : "outline"}
            onClick={() => setFilterStatus("cancelled")}
            className="rounded-full"
          >
            Đã hủy
          </Button>
        </div>

        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <MyBookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <Card className="p-12 text-center border-dashed">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">
                Bạn chưa có tour nào phù hợp bộ lọc.
              </p>
              <Button asChild className="rounded-full">
                <Link href="/">Khám phá các tour</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
