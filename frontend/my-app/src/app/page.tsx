import Hero from "@/components/home/HeroSection";
import Story from "@/components/home/StorySection";
import PopularDestinations from "@/components/destinations/PopularDestinations";
import destinationService from "@/services/destination.service";

export default async function Home() {
  const popularDestinations = await destinationService.getPopular();

  return (
    <main>
      <Hero />
      <Story />
      <PopularDestinations destinations={popularDestinations} />
    </main>
  );
}
