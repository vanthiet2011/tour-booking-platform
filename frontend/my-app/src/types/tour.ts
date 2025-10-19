import { PagingResponse } from ".";
import { Destination } from "./destination";

export interface TourDeparture {
  id: string;
  departureTime: string;
  availableSlots: number;
}

export interface TourSchedule {
  id: string;
  day: number;
  title: string;
  content: string;
}

export interface Tour {
  id: string;
  name: string;
  duration: string;
  description: string;
  overview: string;
  priceAdult: number;
  priceChild: number;
  includes: string[];
  excludes: string[];
  highlights: string[];
  images: string[];
  destinations: Destination[];
  schedules: TourSchedule[];
  departures: TourDeparture[];
}

export interface CreateTourDto {
  name: string;
  duration: string;
  description: string;
  overview: string;
  priceAdult: number;
  priceChild: number;
  includes: string[];
  excludes: string[];
  highlights: string[];
  images: string[];
  destinationIds: string[];
  schedules: Omit<TourSchedule, "id">[];
}

export type UpdateTourDto = Partial<CreateTourDto>;

export type TourPagingResponse = PagingResponse<Tour>;
