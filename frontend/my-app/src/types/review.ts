export interface Review {
  id: string;
  tourId: string;
  userId: string;
  userName?: string;
  avatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  tourId: string;
  rating: number;
  comment?: string;
}

export interface CheckEligibilityResponse {
  canReview: boolean;
  message?: string;
}
