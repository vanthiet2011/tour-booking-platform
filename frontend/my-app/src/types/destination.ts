import { PagingResponse } from ".";

export interface Destination {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  region: string;
  isPopular: boolean;
  createdAt: string;
}

export interface CreateDestinationPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  region: string;
  isPopular?: boolean;
}

export interface UpdateDestinationPayload extends CreateDestinationPayload {}

export type DestinationPagingResponse = PagingResponse<Destination>;
