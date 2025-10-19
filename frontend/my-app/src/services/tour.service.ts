// src/services/tour.service.ts
import apiClient from "./api-client";
import {
  Tour,
  TourPagingResponse,
  CreateTourDto,
  UpdateTourDto,
} from "@/types/tour";

const tourService = {
  getAll: async (params: URLSearchParams): Promise<TourPagingResponse> => {
    const { data } = await apiClient.get<TourPagingResponse>("/tours", {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<Tour> => {
    const { data } = await apiClient.get<Tour>(`/tours/${id}`);
    return data;
  },

  create: async (tourData: CreateTourDto): Promise<Tour> => {
    const { data } = await apiClient.post<Tour>("/tours", tourData);
    return data;
  },

  update: async (id: string, tourData: UpdateTourDto): Promise<Tour> => {
    const { data } = await apiClient.put<Tour>(`/tours/${id}`, tourData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tours/${id}`);
  },
};

export default tourService;
