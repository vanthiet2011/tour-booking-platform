// src/lib/api.ts
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Hàm Helper được cập nhật để an toàn về kiểu dữ liệu ---
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = Cookies.get("accessToken");
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 3. Gửi yêu cầu với đối tượng headers đã được chuẩn hóa
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    } catch {
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  // Nếu response có thể không có body (ví dụ: 204 No Content)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  // Trả về null hoặc một đối tượng trống nếu không có JSON body
  return null;
}

export const loginUser = async (credentials: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Email hoặc mật khẩu không hợp lệ");
  }

  return response.json();
};

export interface Destination {
  destinationId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  region: string;
  isPopular: boolean;
  createdAt: string;
}
export interface CreateDestinationPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  region: string;
  isPopular?: boolean;
}

export interface UpdateDestinationPayload extends CreateDestinationPayload {}

export const getDestinations = async (): Promise<Destination[]> => {
  return fetchWithAuth("/api/destinations", {
    method: "GET",
  });
};

export const getPopularDestinations = async (): Promise<Destination[]> => {
  const response = await fetch(`${API_BASE_URL}/api/destinations/popular`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    return [];
  }
  return response.json();
};

export const createDestination = async (data: CreateDestinationPayload) => {
  return fetchWithAuth("/api/destinations", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateDestination = async (
  id: string,
  data: UpdateDestinationPayload
): Promise<void> => {
  return fetchWithAuth(`/api/destinations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteDestination = async (id: string): Promise<void> => {
  return fetchWithAuth(`/api/destinations/${id}`, {
    method: "DELETE",
  });
};
