// src/lib/api.ts

import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const loginUser = async (credentials: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Email hoặc mật khẩu không hợp lệ");
  }

  return response.json();
};

export interface CreateDestinationPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  region: string; // Backend cũng yêu cầu trường này
}

export const createDestination = async (data: CreateDestinationPayload) => {
  const token = Cookies.get("accessToken");

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const response = await fetch(`${API_BASE_URL}/api/destinations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể tạo điểm đến.");
  }

  return response.json();
};
