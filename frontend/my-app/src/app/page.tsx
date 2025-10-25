import Hero from "@/components/home/Hero";
import PopularDestinations from "@/components/destinations/PopularDestinations";
import destinationService from "@/services/destination.service";

export default async function Home() {
  const popularDestinations = await destinationService.getPopular();

  return (
    <main>
      <Hero />
      <PopularDestinations destinations={popularDestinations} />
    </main>
  );
}
