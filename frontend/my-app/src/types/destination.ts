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

export interface UpdateDestinationPayload extends CreateDestinationPayload {}

export type DestinationPagingResponse = PagingResponse<Destination>;
