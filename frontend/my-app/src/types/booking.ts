export type ParticipantType = "Adult" | "Child" | "Infant";

export interface BookingDetail {
  participantType: ParticipantType;
  quantity: number;
  unitPrice: number;
}

export interface BookingPayload {
  tourDepartureId: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  note?: string;
  paymentMethod?: string;
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
  tourName: string;
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
  endDate: string;
  createdAt: string;
  updatedAt?: string;
  bookingDetails: BookingDetail[];
}

export interface BookingItem {
  id: string;
  tourId: string;
  tourName: string;
  contactFullName: string;
  contactEmail: string;
  status: BookingStatus;
  totalPrice: number;
  startDate: string;
  paymentMethod?: string;
  paymentStatus: string;
  createdAt: string;
  adults: number;
  children: number;
  infants: number;
}

export interface BookingPaginationResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: BookingItem[];
}

export interface FormDataState {
  name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
}

export interface TouristsState {
  adults: number;
  children: number;
  infants: number;
}

export interface BookingFormReadOnlyProps {
  formData: FormDataState;
  tourists: TouristsState;
  paymentMethod?: string;
}
