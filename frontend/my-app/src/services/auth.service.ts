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
      "/api/auth/login",
      credentials
    );
    return data;
  },

  register: async (userInfo: RegisterRequest): Promise<User> => {
    const { data } = await apiClient.post<User>("/api/auth/register", userInfo);
    return data;
  },

  getMe: async (): Promise<ApiUser> => {
    const { data } = await apiClient.get<ApiUser>("/api/auth/me");
    return data;
  },

  loginWithGoogle: async (token: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/api/auth/login/google",
      {
        token,
      }
    );
    return data;
  },

  loginWithFacebook: async (token: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/api/auth/login/facebook",
      { token }
    );
    return data;
  },
};

export default authService;
