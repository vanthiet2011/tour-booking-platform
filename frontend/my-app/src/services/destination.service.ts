import apiClient from "./api-client";
import {
  Destination,
  CreateDestinationPayload,
  UpdateDestinationPayload,
} from "@/types/destination";

import { PaginatedResponse } from "@/types";

interface GetAllDestinationsParams {
  categoryId?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const destinationService = {
  getAll: async (
    params?: GetAllDestinationsParams
  ): Promise<PaginatedResponse<Destination>> => {
    const { limit, ...rest } = params || {};

    const apiParams = {
      ...rest,
      pageSize: limit,
    };

    const { data } = await apiClient.get<PaginatedResponse<Destination>>(
      "/destinations",
      { params: apiParams }
    );

    return data;
  },

  getById: async (id: string): Promise<Destination> => {
    const { data } = await apiClient.get<Destination>(`/destinations/${id}`);
    return data;
  },

  getPopular: async (): Promise<Destination[]> => {
    const { data } = await apiClient.get<Destination[]>(
      "/destinations/popular"
    );
    return data;
  },

  create: async (payload: CreateDestinationPayload): Promise<Destination> => {
    const { data } = await apiClient.post<Destination>(
      "/destinations",
      payload
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateDestinationPayload
  ): Promise<void> => {
    await apiClient.put(`/destinations/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/destinations/${id}`);
  },
};

export default destinationService;
