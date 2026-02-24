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
  getPaginatedTours: async (
    params: URLSearchParams
  ): Promise<TourPagingResponse> => {
    if (!params.has("pageSize")) {
      params.set("pageSize", "9");
    }
    const { data } = await apiClient.get<TourPagingResponse>(
      `/tours?${params.toString()}`
    );
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

  getRelatedTours: async (id: string): Promise<Tour[]> => {
    const { data } = await apiClient.get<Tour[]>(`/tours/${id}/related`);
    return data || [];
  },
};

export default tourService;
