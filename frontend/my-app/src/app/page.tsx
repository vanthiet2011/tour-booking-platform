// src/app/page.tsx

import Hero from "@/components/Hero";
import PopularDestinations from "@/components/PopularDestinations";
import { getPopularDestinations } from "@/lib/api";

export default async function Home() {
  // Fetch dữ liệu trên server
  const popularDestinations = await getPopularDestinations();

  return (
    <main>
      <Hero />
      {/* Truyền dữ liệu đã fetch vào component PopularDestinations */}
      <PopularDestinations destinations={popularDestinations} />
      {/* ... các component khác */}
    </main>
  );
}
