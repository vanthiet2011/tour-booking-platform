// src/services/tour.service.ts
import apiClient from "./api-client";
import {
  Tour,
  TourPagingResponse,
  CreateTourPayload,
  UpdateTourPayload,
} from "@/types/tour";

const tourService = {
  getAll: async (params: URLSearchParams): Promise<TourPagingResponse> => {
    const { data } = await apiClient.get<TourPagingResponse>("/api/tours", {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<Tour> => {
    const { data } = await apiClient.get<Tour>(`/api/tours/${id}`);
    return data;
  },

  getToursByDestination: async (destinationId: string): Promise<Tour[]> => {
    const { data } = await apiClient.get<Tour[]>(
      `/api/destinations/${destinationId}/tours`
    );
    return data;
  },

  create: async (tourData: CreateTourPayload): Promise<Tour> => {
    const { data } = await apiClient.post<Tour>("/api/tours", tourData);
    return data;
  },

  update: async (id: string, tourData: UpdateTourPayload): Promise<Tour> => {
    const { data } = await apiClient.put<Tour>(`/api/tours/${id}`, tourData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/tours/${id}`);
  },
};

export default tourService;
