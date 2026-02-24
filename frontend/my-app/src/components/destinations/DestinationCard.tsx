// src/components/destinations/DestinationCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Destination } from "@/types/destination";
import { Badge } from "@/components/ui/badge";
import { getFullImageUrl } from "@/lib/utils";
import { motion } from "framer-motion";

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="h-full"
    >
      <Link href={`/destinations/${destination.id}`} className="block h-full">
        <Card className="overflow-hidden shadow-md transition-all hover:shadow-lg group h-full flex flex-col m-0 p-0 rounded-none">
          <div className="relative w-full h-48 flex-shrink-0">
            <Image
              src={getFullImageUrl(destination.imageUrl)}
              alt={destination.name ?? "Destination image"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {destination.categories && destination.categories.length > 0 && (
              <div className="absolute bottom-2 left-2 z-10 flex flex-wrap-reverse gap-x-1.5 gap-y-1">
                {destination.categories.filter(Boolean).map((c) => (
                  <Badge
                    key={c.id}
                    variant="secondary"
                    className="text-xs shadow-sm"
                  >
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <CardContent className="px-4 pb-4 flex-grow flex flex-col">
            <CardTitle className="text-lg font-semibold group-hover:text-primary mb-0.5">
              {destination.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {destination.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
