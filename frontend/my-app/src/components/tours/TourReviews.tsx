"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import Image from "next/image";
import { Review } from "@/types/review";
import reviewService from "@/services/review.service";
import { ReviewForm } from "./ReviewForm";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TourReviewsProps {
  tourId: string;
}

export function TourReviews({ tourId }: TourReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [reviewsData, eligibility] = await Promise.all([
        reviewService.getReviewsByTourId(tourId),
        reviewService.checkEligibility(tourId).catch(() => ({ canReview: false })),
      ]);
      setReviews(reviewsData);
      setCanReview(eligibility.canReview);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setIsLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Đánh Giá Từ Khách Hàng
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty mb-6">
            Đánh giá thực tế từ những khách hàng đã trải nghiệm tour
          </p>
          <div className="mx-auto flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(Number(averageRating))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">
              {averageRating}
            </span>
            <span className="text-muted-foreground">
              ({reviews.length} đánh giá)
            </span>
          </div>
        </div>

        {canReview && (
          <div className="mb-12 max-w-2xl mx-auto">
            <ReviewForm tourId={tourId} onSuccess={fetchData} />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} className="border-border/50 bg-card p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex gap-3">
                    {review.avatar ? (
                         <Image
                         src={review.avatar}
                         alt={review.userName || "User"}
                         width={48}
                         height={48}
                         className="rounded-full object-cover"
                       />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-slate-500" />
                        </div>
                    )}
                 
                  <div>
                    <div className="font-semibold text-card-foreground">
                      {review.userName || "Người dùng ẩn danh"}
                    </div>
                    {/* Location is not in Review entity yet, omitting or hardcoding logic if needed */}
                  </div>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(review.createdAt), "dd/MM/yyyy", { locale: vi })}
                </span>
              </div>

              <p className="leading-relaxed text-card-foreground">
                {review.comment}
              </p>
            </Card>
          ))}
          {reviews.length === 0 && !isLoading && (
            <div className="col-span-full text-center text-muted-foreground">
              Chưa có đánh giá nào cho tour này.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
