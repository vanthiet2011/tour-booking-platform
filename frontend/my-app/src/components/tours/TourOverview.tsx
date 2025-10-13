// src/components/tours/TourOverview.tsx

import { Card } from "@/components/ui/card";
import { Compass, Heart, Camera, Leaf, LucideIcon } from "lucide-react";

// Định nghĩa kiểu dữ liệu cho props
interface TourOverviewProps {
  highlights?: string[]; // Cho phép highlights có thể là undefined
}

// Dữ liệu tĩnh cho icon và title
const staticHighlights: { icon: LucideIcon; title: string }[] = [
  { icon: Compass, title: "Tham quan" },
  { icon: Heart, title: "Lưu trú" },
  { icon: Camera, title: "Ăn uống" },
  { icon: Leaf, title: "Hoạt động khác" },
];

// === SỬA ĐỔI CHÍNH Ở ĐÂY ===
export function TourOverview({ highlights = [] }: TourOverviewProps) {
  return (
    <section className="bg-secondary/30 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-sans text-3xl font-bold text-foreground sm:text-4xl lg:text-4xl">
            Điểm Nổi Bật Của Tour
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Trải nghiệm những điều tuyệt vời nhất mà hành trình mang lại
          </p>
        </div>

        {/* Chỉ hiển thị grid nếu có highlights */}
        {highlights.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((description, index) => {
              const staticData = staticHighlights[index] || staticHighlights[0];
              return (
                <Card
                  key={index}
                  className="border-border/50 bg-card p-6 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <staticData.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-0">
                      {staticData.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
