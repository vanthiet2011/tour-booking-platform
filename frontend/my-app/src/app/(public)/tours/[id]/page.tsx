// import { getTourById, getTourDeparturesById } from "@/lib/api";
import tourService from "@/services/tour.service";
import { notFound } from "next/navigation";

// Import tất cả các component bạn đã tạo
import { TourHero } from "@/components/tours/TourHero";
import { TourGallery } from "@/components/tours/TourGallery";
import { TourOverview } from "@/components/tours/TourOverview";
import { TourItinerary } from "@/components/tours/TourItinerary";
import { TourInclusions } from "@/components/tours/TourInclusions";

import { TourReviews } from "@/components/tours/TourReviews";
import { TourFAQ } from "@/components/tours/TourFAQ";
import { BookingForm } from "@/components/tours/BookingForm";
import { RelatedTours } from "@/components/tours/RelatedTours";

interface TourDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TourDetailPage(props: TourDetailPageProps) {
  const params = await props.params;
  const { id } = params;

  const [tour, departures] = await Promise.all([
    tourService.getById(id),
    tourService.getTourDeparturesById(id),
  ]);

  if (!tour) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <TourHero tour={tour} />
      <div id="tour-details">
        <TourOverview highlights={tour.highlights || []} />
      </div>
      <TourGallery tour={tour} />
      <div className="container mx-auto px-30 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-16">
            <TourItinerary schedules={tour.schedules || []} />
            <TourInclusions tour={tour} />
          </div>
          <div id="booking-section" className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <BookingForm tour={tour} departures={departures} />
            </div>
          </div>
        </div>
      </div>
      <TourReviews tourId={tour.id} />
      <div className="container mx-auto px-30 pb-16">
         <RelatedTours currentTourId={tour.id} />
      </div>
      <TourFAQ />
    </main>
  );
}
