import { PagingResponse } from ".";

export interface Category {
  id: string;
  name: string;
}
export interface Destination {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  region: string;
  isPopular: boolean;
  createdAt: string;
  categories: Category[];
}

export interface CreateDestinationPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  region: string;
  isPopular?: boolean;
  categoryIds: string[];
}

export interface GetAllDestinationsParams {
  categoryId?: string;
  region?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export type UpdateDestinationPayload = CreateDestinationPayload;

export type DestinationPagingResponse = PagingResponse<Destination>;
