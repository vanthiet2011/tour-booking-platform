// src/services/tour.service.ts
import apiClient from "./api-client";
import {
  Tour,
  TourDepartureInfo,
  TourPagingResponse,
  CreateTourPayload,
  UpdateTourPayload,
} from "@/types/tour";

const tourService = {
  getAll: async (params?: URLSearchParams): Promise<Tour[]> => {
    const { data } = await apiClient.get<Tour[]>("/tours", {
      params: params instanceof URLSearchParams ? params : undefined,
    });
    return data;
  },

  getById: async (id: string): Promise<Tour> => {
    const { data } = await apiClient.get<Tour>(`/tours/${id}`);
    return data;
  },

  getToursByDestination: async (destinationId: string): Promise<Tour[]> => {
    const { data } = await apiClient.get<Tour[]>(
      `/destinations/${destinationId}/tours`
    );
    return data;
  },

  getTourDeparturesById: async (
    tourId: string
  ): Promise<TourDepartureInfo[]> => {
    const { data } = await apiClient.get<TourDepartureInfo[]>(
      `/tours/${tourId}/departures`
    );
    return data || [];
  },

  create: async (tourData: CreateTourPayload): Promise<Tour> => {
    const { data } = await apiClient.post<Tour>("/tours", tourData);
    return data;
  },

  update: async (id: string, tourData: UpdateTourPayload): Promise<Tour> => {
    const { data } = await apiClient.put<Tour>(`/tours/${id}`, tourData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tours/${id}`);
  },
};

export default tourService;
