import Hero from "@/components/home/HeroSection";
import Story from "@/components/home/StorySection";
import { FeaturedTours } from "@/components/home/FeaturedTours";
import PopularDestinations from "@/components/home/PopularDestinations";
import destinationService from "@/services/destination.service";
import { DestinationJourney } from "@/components/home/DestinationJourney";
import { TrustSignals } from "@/components/home/TrustSignals";
import { Testimonials } from "@/components/home/Testimonials";

export const dynamic = "force-dynamic";

export default async function Home() {
  const popularDestinations = await destinationService.getPopular();

  return (
    <main>
      <Hero />
      <Story />
      <FeaturedTours />
      <PopularDestinations destinations={popularDestinations} />
      <DestinationJourney />
      <Testimonials />
      <TrustSignals />
    </main>
  );
}
