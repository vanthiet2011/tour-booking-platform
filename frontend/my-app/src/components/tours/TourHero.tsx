import { Tour } from "@/lib/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Tag, Star } from "lucide-react";

// Hàm helper định dạng tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function TourHero({ tour }: { tour: Tour }) {
  const displayDestinations =
    tour.tourDestinations
      ?.slice(0, 3)
      .map((td) => td.destination.name)
      .join(" – ") || "Nhiều điểm đến";

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden text-white">
      {/* Ảnh nền */}
      <div className="absolute inset-0">
        <Image
          src={tour.imageUrl || "/placeholder.svg"}
          alt={tour.name}
          fill
          priority
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Nội dung */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
        {/* Header (có thể giữ thương hiệu hoặc bỏ nếu dùng layout riêng) */}
        <header className="flex items-center justify-between"></header>

        {/* Hero content */}
        <div className="mb-12 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/90 px-4 py-2 text-sm font-medium text-accent-foreground backdrop-blur-sm">
            <Star className="h-4 w-4 fill-current" />
            <span>Tour Nổi Bật</span>
          </div>

          {/* Tên tour */}
          <h1 className="w-full text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {tour.name}
          </h1>

          {/* Mô tả tour */}
          <p className="max-w-2xl text-lg leading-relaxed text-white/90 text-pretty sm:text-xl">
            {tour.description ||
              "Hành trình khám phá kỳ quan thiên nhiên, trải nghiệm văn hóa và ẩm thực địa phương đặc sắc."}
          </p>

          {/* Thông tin nhanh */}
          <div className="flex flex-wrap gap-4 text-white">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Clock className="h-5 w-5" />
              <span className="font-medium">{tour.duration}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <MapPin className="h-5 w-5" />
              <span className="font-medium truncate max-w-[150px] sm:max-w-none">
                {displayDestinations}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Tag className="h-5 w-5" />
              <span className="font-medium">
                {formatCurrency(tour.pricePerAdult)}
              </span>
            </div>
            {/* {tour.maxGroupSize && (
              <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Users className="h-5 w-5" />
                <span className="font-medium">
                  Tối đa {tour.maxGroupSize} người
                </span>
              </div>
            )} */}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Đặt Tour Ngay
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              Xem Chi Tiết
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
