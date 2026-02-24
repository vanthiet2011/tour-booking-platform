export interface UserProfile {
  id: string;
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  createAt: string;
  updateAt: string | null;
}

export interface UpdateProfileDto {
  fullName: string | null;
  dateOfBirth?: string | null;
  gender: "Male" | "Female" | "Other" | string | null;
  address: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
}

export interface TopTour {
  tourId: string;
  tourName: string;
  bookedCount: number;
  totalSlots: number;
}
