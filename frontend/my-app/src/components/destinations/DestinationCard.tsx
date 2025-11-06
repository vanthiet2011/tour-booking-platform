// src/components/destinations/DestinationCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Destination } from "@/types/destination"; //

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link href={`/destinations/${destination.id}`} className="h-full block">
      {" "}
      {/*/page.tsx] */}
      <Card className="overflow-hidden shadow-md transition-all hover:shadow-lg group h-full flex flex-col">
        <div className="relative w-full h-48 flex-shrink-0">
          <Image
            src={destination.imageUrl ?? "/images/placeholder.jpg"}
            alt={destination.name ?? "Destination image"}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="px-4 flex-grow">
          <CardTitle className="text-lg font-semibold group-hover:text-primary">
            {destination.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {destination.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
