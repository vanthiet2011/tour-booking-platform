import apiClient from "./api-client";
import { Review, CreateReviewPayload, CheckEligibilityResponse } from "@/types/review";

const reviewService = {
  getReviewsByTourId: async (tourId: string): Promise<Review[]> => {
    const { data } = await apiClient.get<Review[]>(`/reviews/tour/${tourId}`);
    return data;
  },

  createReview: async (reviewData: CreateReviewPayload): Promise<Review> => {
    const { data } = await apiClient.post<Review>("/reviews", reviewData);
    return data;
  },

  checkEligibility: async (tourId: string): Promise<CheckEligibilityResponse> => {
    const { data } = await apiClient.get<CheckEligibilityResponse>(`/reviews/check-eligibility/${tourId}`);
    return data;
  }
};

export default reviewService;
