"use client";

import { Tour } from "@/types/tour";
import Image from "next/image";
import { getFullImageUrl } from "@/lib/utils";

export function TourGallery({ tour }: { tour: Tour }) {
  const images = tour.galleryImages || [];

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-sans text-3xl font-bold text-foreground sm:text-4xl lg:text-4xl">
            Hình Ảnh Tour
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Những khoảnh khắc đáng nhớ từ hành trình khám phá
          </p>
        </div>

        <div className="grid auto-rows-[300px] grid-cols-2 gap-2 lg:grid-cols-4">
          {images.slice(0, 5).map((src, index) => {
            const imageUrl = getFullImageUrl(src);
            const span =
              index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1";

            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-xl ${span}`}
              >
                <Image
                  src={imageUrl}
                  alt={`Ảnh tour ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                  unoptimized
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-medium">{`Ảnh tour ${index + 1}`}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
