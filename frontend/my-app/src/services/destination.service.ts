import apiClient from "./api-client";
import {
  Destination,
  CreateDestinationPayload,
  UpdateDestinationPayload,
} from "@/types/destination";
import { Tour } from "@/types/tour";
import { get } from "http";

const destinationService = {
  getAll: async (): Promise<Destination[]> => {
    const { data } = await apiClient.get<Destination[]>("/api/destinations");
    return data;
  },

  getById: async (id: string): Promise<Destination> => {
    const { data } = await apiClient.get<Destination>(
      `/api/destinations/${id}`
    );
    return data;
  },

  create: async (payload: CreateDestinationPayload): Promise<Destination> => {
    const { data } = await apiClient.post<Destination>(
      "/api/destinations",
      payload
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateDestinationPayload
  ): Promise<void> => {
    await apiClient.put(`/api/destinations/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/destinations/${id}`);
  },
};

export default destinationService;
