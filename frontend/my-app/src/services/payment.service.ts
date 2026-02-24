import {
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentStatus,
} from "@/types/payment";
import apiClient from "./api-client";

export const paymentService = {
  /* ================= INITIATE PAYMENT ================= */

  /* ================= PAYPAL CAPTURE ================= */
  capturePayPal: async (params: {
    paymentId: string;
    payPalOrderId: string;
  }) => {
    const response = await apiClient.post("/paypal/capture", params);
    return response.data;
  },

  /* ================= STATUS ================= */
  getStatusByBookingId: async (bookingId: string): Promise<PaymentStatus> => {
    const response = await apiClient.get<PaymentStatus>(
      `/payments/status/${bookingId}`,
    );
    return response.data;
  },

  getStatusById: async (paymentId: string): Promise<PaymentStatus> => {
    const response = await apiClient.get<PaymentStatus>(
      `/payments/${paymentId}`,
    );
    return response.data;
  },

  /* ================= PAYMENT LOOKUP ================= */
  getLatestPaymentByBookingId: async (bookingId: string) => {
    const response = await apiClient.get<{
      id: string;
      status: string;
      paymentLink?: string;
    }>(`/payments/latest/by-booking/${bookingId}`);

    return response.data;
  },

  /* ================= KAFKA WAIT HELPER ================= */
  waitForPaymentReady: async (
    bookingId: string,
    maxRetry = 15,
    intervalMs = 2000,
  ) => {
    for (let i = 0; i < maxRetry; i++) {
      try {
        const payment =
          await paymentService.getLatestPaymentByBookingId(bookingId);

        if (payment?.id) {
          return payment;
        }
      } catch {
        // Kafka chưa sync
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    throw new Error("Hệ thống thanh toán phản hồi chậm");
  },
  /* ================= OFFICE CONFIRM ================= */
  confirmOfficePayment: async (payload: {
    bookingId: string;
    staffId?: string;
  }): Promise<void> => {
    await apiClient.post("/payments/office/confirm", payload);
  },

  /* ================= VNPAY MANUAL CHECK ================= */
  verifyVnPay: async (queryString: string) => {
      // Call directly to the same endpoint ensuring Gateway routes it correctly.
      // Assuming Gateway routes /payment/api/vnpay/ipn -> Service /api/vnpay/ipn
      return apiClient.get(`/vnpay/ipn?${queryString}`);
  },
};

