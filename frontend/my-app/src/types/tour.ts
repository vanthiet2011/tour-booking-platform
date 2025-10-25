import { PagingResponse } from ".";
import { Destination } from "./destination";

export interface Tour {
  id: string;
  name: string;
  description?: string;
  pricePerAdult: number;
  pricePerChild: number;
  duration?: string;
  isBestseller: boolean;
  imageUrl?: string;
  destinations: { id: string; name: string }[];
  schedules: TourSchedule[];
  tourDepartures: TourDeparture[];
  highlights: string[];
  galleryImages: string[];
  inclusions: Inclusions;
}
export interface TourDeparture {
  id: string;
  tourId: string;
  startDate: string;
  endDate: string;
  availableSlots: number;
}

export interface TourDepartureInfo {
  id: string;
  startDate: string;
  endDate: string;
  availableSlots: number;
}

export interface TourSchedule {
  id: string;
  dayNumber: number;
  title: string;
  description?: string;
}

export interface Inclusions {
  included: string[];
  notIncluded: string[];
}

export interface CreateTourPayload {
  name: string;
  description?: string;
  pricePerAdult: number;
  pricePerChild: number;
  duration?: string;
  isBestseller: boolean;
  imageUrl?: string;
  destinationIds: string[];
  schedules: { dayNumber: number; title: string; description?: string }[];
  tourDepartures: {
    startDate: string;
    endDate: string;
    availableSlots: number;
  }[];
  highlights: string[];
  galleryImages: string[];
  inclusions: Inclusions;
}

export interface UpdateTourPayload extends CreateTourPayload {}

export type TourPagingResponse = PagingResponse<Tour>;
