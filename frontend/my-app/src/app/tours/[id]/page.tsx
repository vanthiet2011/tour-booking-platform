import { getTourById } from "@/lib/api";
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
// TourPricing có thể đã được tích hợp trong BookingForm hoặc TourOverview

interface TourDetailPageProps {
  params: { id: string };
}

export default async function TourDetailPage(props: TourDetailPageProps) {
  const { id } = await props.params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <TourHero tour={tour} />
      <TourOverview highlights={tour.highlights || []} />
      <TourGallery tour={tour} />
      <div className="container mx-auto px-30 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Tour details */}
          <div className="lg:col-span-2 space-y-16">
            <TourItinerary schedules={tour.schedules || []} />
            <TourInclusions tour={tour} />
          </div>

          {/* Right column - Sticky booking form */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <BookingForm />
            </div>
          </div>
        </div>
      </div>
      <TourReviews />
      <TourFAQ />
    </main>
  );
}
