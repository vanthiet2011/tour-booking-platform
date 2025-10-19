export interface UserProfile {
  userId: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: number | null;
}

export type UpdateProfileDto = Omit<UserProfile, "userId" | "email">;
