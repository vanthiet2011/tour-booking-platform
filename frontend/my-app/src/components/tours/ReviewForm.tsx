"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import reviewService from "@/services/review.service";
import { CreateReviewPayload } from "@/types/review";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  tourId: string;
  onSuccess: () => void;
}

export function ReviewForm({ tourId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateReviewPayload>();
  const { toast } = useToast();

  const onSubmit = async (data: CreateReviewPayload) => {
    try {
      await reviewService.createReview({
        tourId,
        rating,
        comment: data.comment,
      });
      toast({
        title: "Thành công",
        description: "Cảm ơn bạn đã đánh giá tour!",
      });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold">Viết đánh giá của bạn</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Đánh giá sao</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Nhận xét (tùy chọn)
        </label>
        <Textarea
          id="comment"
          placeholder="Chia sẻ trải nghiệm của bạn về tour này..."
          {...register("comment")}
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </form>
  );
}
