export type ParticipantType = "Adult" | "Child" | "Infant";

export interface Participant {
  participantType: ParticipantType;
  quantity: number;
}

export interface BookingPayload {
  tourId: string;
  tourDepartureId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  participants: Participant[];
}

export type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";

export interface Booking {
  id: string;
  userId: string;
  tourId: string;
  tourDepartureId: string;
  bookingDate: string;
  totalPrice: number;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  participants: Participant[];
}
