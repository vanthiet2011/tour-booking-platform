// src/services/booking.service.ts
import apiClient from "./api-client";
import { Booking, BookingPayload } from "@/types/booking";

const bookingService = {
  create: async (payload: BookingPayload): Promise<Booking> => {
    const { data } = await apiClient.post<Booking>("/bookings", payload);
    return data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const { data } = await apiClient.get<Booking[]>("/bookings/my-bookings");
    return data;
  },
};

export default bookingService;
