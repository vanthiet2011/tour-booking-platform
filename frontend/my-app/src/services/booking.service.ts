// src/services/booking.service.ts

import apiClient from "./api-client";
import { Booking, BookingPayload, BookingPaginationResponse } from "@/types/booking";

const bookingService = {
  create: async (payload: BookingPayload): Promise<Booking> => {
    const { data } = await apiClient.post<Booking>("/bookings", payload);
    return data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const { data } = await apiClient.get<Booking[]>("/bookings/my-bookings");
    return data;
  },

  getById: async (id: string): Promise<Booking> => {
    const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
    return data;
  },

  cancel: async (id: string): Promise<void> => {
    await apiClient.post(`/bookings/${id}/cancel`);
  },

  cancelBookingAdmin: async (id: string, reason: string = "Admin Cancelled"): Promise<void> => {
    await apiClient.put(`/bookings/${id}/cancel-admin`, null, {
      params: { reason }
    });
  },

  getAllAdmin: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<BookingPaginationResponse> => {
    const { data } = await apiClient.get<BookingPaginationResponse>(
      "/bookings",
      {
        params: {
          page,
          pageSize,
        },
      }
    );
    return data;
  },
};

export default bookingService;
