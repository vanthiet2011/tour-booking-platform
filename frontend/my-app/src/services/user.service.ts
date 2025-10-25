import { UserProfile, UpdateProfileDto } from "@/types/user";
import apiClient from "./api-client";

const userService = {
  getMe: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>("/api/UserProfiles/me");
    return data;
  },

  updateMe: async (profileData: UpdateProfileDto): Promise<void> => {
    await apiClient.put("/api/UserProfiles/me", profileData);
  },
};

export default userService;
