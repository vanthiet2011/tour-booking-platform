import { PagingResponse } from ".";

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
  availableSlots: number;
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
  totalSlots: number;
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
    totalSlots: number;
  }[];
  highlights: string[];
  galleryImages: string[];
  inclusions: Inclusions;
}

export type UpdateTourPayload = CreateTourPayload;

export type TourPagingResponse = PagingResponse<Tour>;

export type TourFormValues = Omit<CreateTourPayload, "galleryImages"> & {
  galleryImages?: string[];
  coverImageFile?: FileList;
  galleryImageFiles?: FileList;
  imageUrl?: string;
};
