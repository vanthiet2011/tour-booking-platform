export type ParticipantType = "Adult" | "Child" | "Infant";

export interface BookingDetail {
  participantType: ParticipantType;
  quantity: number;
}

export interface BookingPayload {
  tourDepartureId: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  note?: string;
  bookingDetails: BookingDetail[];
}

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Failed"
  | "Completed";

export interface Booking {
  id: string;
  userId: string;
  tourId: string;
  tourDepartureId: string;
  status: BookingStatus;
  totalPrice: number;
  contactFullName: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  note?: string;
  failureReason?: string;
  paymentLink?: string;
  startDate: string;
  createdAt: string;
  updatedAt?: string;
  details: BookingDetail[];
}
