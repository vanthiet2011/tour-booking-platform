import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getCookie } from "cookies-next";

const isServer = typeof window === "undefined";
const baseURL = isServer ? process.env.INTERNAL_API_URL : "";

const apiClient: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logic xử lý khi token hết hạn, ví dụ: logout người dùng
      // Hoặc gọi API refresh token
      console.error("Unauthorized access - 401");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
