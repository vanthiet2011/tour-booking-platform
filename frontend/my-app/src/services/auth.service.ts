import apiClient from "./api-client";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ApiUser,
} from "@/types/auth";

const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return data;
  },

  register: async (userInfo: RegisterRequest): Promise<User> => {
    const { data } = await apiClient.post<User>("/auth/register", userInfo);
    return data;
  },

  getMe: async (): Promise<ApiUser> => {
    const { data } = await apiClient.get<ApiUser>("/auth/me");
    return data;
  },
};

export default authService;
