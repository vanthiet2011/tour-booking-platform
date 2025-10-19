// src/services/destination.service.ts
import apiClient from "./api-client";
import {
  Destination,
  DestinationPagingResponse,
  CreateDestinationDto,
} from "@/types/destination";

const destinationService = {
  getAll: async (
    params: URLSearchParams
  ): Promise<DestinationPagingResponse> => {
    const { data } = await apiClient.get<DestinationPagingResponse>(
      "/destinations",
      { params }
    );
    return data;
  },

  create: async (
    destinationData: CreateDestinationDto
  ): Promise<Destination> => {
    const { data } = await apiClient.post<Destination>(
      "/destinations",
      destinationData
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/destinations/${id}`);
  },
};

export default destinationService;
