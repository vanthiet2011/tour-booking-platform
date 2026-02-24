// src/components/PopularDestinations.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Destination } from "@/types/destination";
import { getFullImageUrl } from "@/lib/utils";
import { motion } from "framer-motion";

interface PopularDestinationsProps {
  destinations: Destination[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 } 
  }
};

export default function PopularDestinations({
  destinations,
}: PopularDestinationsProps) {
  const topRowDestinations = destinations.slice(0, 2);
  const bottomRowDestinations = destinations.slice(2, 5);

  const renderDestinationCard = (destination: Destination, index: number) => (
    <motion.div key={destination.id} variants={itemVariants} className="h-full">
      <Link
        href={`/destinations/${destination.id}`}
        passHref
        className="block h-[300px] md:h-full"
      >
        <Card className="group relative w-full h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Image
            src={getFullImageUrl(destination.imageUrl)}
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
    </motion.div>
  );

  return (
    <section className="py-8 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Điểm Đến <span className="text-primary">Phổ Biến</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá những địa điểm du lịch được yêu thích nhất tại Việt Nam
          </p>
        </motion.div>

        {destinations && destinations.length > 0 ? (
          <motion.div 
            className="flex flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2 h-auto md:h-[300px]">
              {topRowDestinations.map((dest, index) =>
                renderDestinationCard(dest, index)
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-2 h-auto md:h-[300px]">
              {bottomRowDestinations.map((dest, index) =>
                renderDestinationCard(dest, index + topRowDestinations.length)
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-center mt-12 text-muted-foreground">
            <p>Hiện chưa có điểm đến phổ biến nào.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/destinations">
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition">
              Xem Tất Cả Điểm đến →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
