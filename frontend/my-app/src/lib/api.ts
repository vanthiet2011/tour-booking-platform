import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Hàm Helper để tự động đính kèm Token ---
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = Cookies.get("accessToken");
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

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

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return null;
}

// --- Auth ---
export const loginUser = async (credentials: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error("Email hoặc mật khẩu không hợp lệ");
  return response.json();
};

// --- Destinations ---
export interface Destination {
  id: string; // Đã đồng bộ thành 'id'
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
  return fetchWithAuth("/api/destinations");
};

export const getPopularDestinations = async (): Promise<Destination[]> => {
  const response = await fetch(`${API_BASE_URL}/api/destinations/popular`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return [];
  return response.json();
};

export const createDestination = async (
  data: CreateDestinationPayload
): Promise<Destination> => {
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
  return fetchWithAuth(`/api/destinations/${id}`, { method: "DELETE" });
};

// --- Tours ---
export interface TourSchedule {
  id: string;
  dayNumber: number;
  title: string;
  description?: string;
}

export interface TourDeparture {
  id: string;
  tourId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  availableSlots: number;
}

export interface TourDepartureInfo {
  id: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  availableSlots: number;
}

export interface Inclusions {
  included: string[];
  notIncluded: string[];
}

export interface Tour {
  id: string; // Đã đồng bộ thành 'id'
  name: string;
  description?: string;
  pricePerAdult: number;
  pricePerChild: number;
  duration?: string;
  isBestseller: boolean;
  imageUrl?: string;
  destinations: { id: string; name: string }[];
  schedules: TourSchedule[];
  tourDepartures: TourDeparture[];
  highlights: string[];
  galleryImages: string[];
  inclusions: Inclusions;
}

export interface CreateTourPayload {
  name: string;
  description?: string;
  pricePerAdult: number;
  pricePerChild: number;
  duration?: string;
  isBestseller: boolean;
  imageUrl?: string;
  destinationIds: string[];
  schedules: { dayNumber: number; title: string; description?: string }[];
  tourDepartures: {
    startDate: string;
    endDate: string;
    availableSlots: number;
  }[];
  highlights: string[];
  galleryImages: string[];
  inclusions: Inclusions;
}

export interface UpdateTourPayload extends CreateTourPayload {}

export interface CreateBookingPayload {
  tourDepartureId: string;
  details: {
    participantType: "Adult" | "Child";
    quantity: number;
  }[];
}

export const getTours = async (): Promise<Tour[]> => {
  return fetchWithAuth("/api/tours");
};

export const getTourById = async (id: string): Promise<Tour | null> => {
  try {
    const data = await fetchWithAuth(`/api/tours/${id}`);
    console.log("✅ Tour data fetched:", data); // 👉 LOG ở đây
    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch tour with id ${id}:`, error);
    return null;
  }
};

export const createTour = async (data: CreateTourPayload): Promise<Tour> => {
  return fetchWithAuth("/api/tours", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateTour = async (
  id: string,
  data: UpdateTourPayload
): Promise<void> => {
  return fetchWithAuth(`/api/tours/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteTour = async (id: string): Promise<void> => {
  return fetchWithAuth(`/api/tours/${id}`, { method: "DELETE" });
};

export const getToursByDestination = async (
  destinationId: string
): Promise<Tour[]> => {
  return fetchWithAuth(`/api/destinations/${destinationId}/tours`);
};

export const getTourDeparturesById = async (
  tourId: string
): Promise<TourDepartureInfo[]> => {
  try {
    const data = await fetchWithAuth(`/api/tours/${tourId}/departures`);
    return data || []; // Trả về mảng rỗng nếu data là null
  } catch (error) {
    console.error(`Failed to fetch departures for tour ${tourId}:`, error);
    return []; // Trả về mảng rỗng khi có lỗi
  }
};

export const getDestinationById = async (
  id: string
): Promise<Destination | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/destinations/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to fetch destination:", error);
    return null;
  }
};

export const uploadFile = async (
  formData: FormData
): Promise<{ filePath: string }> => {
  const token = Cookies.get("accessToken");
  const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Không cần 'Content-Type', trình duyệt sẽ tự xử lý cho FormData
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
  return response.json();
};

export const uploadMultipleFiles = async (
  formData: FormData
): Promise<{ filePaths: string[] }> => {
  const token = Cookies.get("accessToken");
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/files/upload-multiple`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload multiple files");
  }
  return response.json(); // Backend trả về object { filePaths: [...] }
};
