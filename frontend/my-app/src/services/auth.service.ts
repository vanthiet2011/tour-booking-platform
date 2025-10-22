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

  loginWithGoogle: async (token: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>("/auth/login/google", {
      token,
    });
    return data;
  },

  loginWithFacebook: async (token: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login/facebook",
      { token }
    );
    return data;
  },
};

export default authService;
