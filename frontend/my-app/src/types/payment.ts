export interface BookingStatusResponse {
  bookingId: string;
  status: "Pending" | "Succeeded" | "Failed" | "Expired" | "Refunded";
  amount: number;
  updatedAt: string;
}

export enum PaymentMethod {
  AtOffice = 1,
  VnPay = 2,
  PayPal = 3,
}

export interface InitiatePaymentRequest {
  bookingId: string;
  method: PaymentMethod;
}

export interface PaymentStatus {
  bookingId: string;
  status: string;
  paymentMethod?: string;
  amount: number;
  updatedAt: string;
  paymentLink?: string;
  paymentId: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  paymentLink: string;
}
