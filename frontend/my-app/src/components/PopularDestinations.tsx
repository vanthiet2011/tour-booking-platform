// src/components/PopularDestinations.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Destination } from "@/lib/api";

interface PopularDestinationsProps {
  destinations: Destination[];
}

export default function PopularDestinations({
  destinations,
}: PopularDestinationsProps) {
  const topRowDestinations = destinations.slice(0, 2);
  const bottomRowDestinations = destinations.slice(2, 5);

  const renderDestinationCard = (destination: Destination, index: number) => (
    <Link
      href={`/destinations/${destination.id}`}
      passHref
      key={destination.id}
    >
      <Card className="group relative w-full h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <Image
          src={destination.imageUrl || "/placeholder.svg"}
          alt={destination.name}
          fill
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={index === 0}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <CardContent className="absolute bottom-0 left-0 p-6 w-full text-white">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <MapPin className="h-4 w-4" />
            <span>{destination.region}</span>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold mt-1">
            {destination.name}
          </h3>
          <p className="mt-2 text-sm opacity-90 line-clamp-2">
            {destination.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <section className="py-20 bg-background">
      <div className="w-4/5 mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Điểm đến <span className="text-primary">phổ biến</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá những địa điểm du lịch được yêu thích nhất tại Việt Nam
          </p>
        </div>

        {destinations && destinations.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* 🚀 Hàng trên: Giảm khoảng cách, đặt chiều cao cố định */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
              {topRowDestinations.map((dest, index) =>
                renderDestinationCard(dest, index)
              )}
            </div>
            {/* 🚀 Hàng dưới: Giảm khoảng cách, đặt chiều cao cố định */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[300px]">
              {bottomRowDestinations.map((dest, index) =>
                renderDestinationCard(dest, index + topRowDestinations.length)
              )}
            </div>
          </div>
        ) : (
          <div className="text-center mt-12 text-muted-foreground">
            <p>Hiện chưa có điểm đến phổ biến nào.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/destinations" passHref>
            <Button variant="outline" size="lg">
              Xem tất cả điểm đến
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
