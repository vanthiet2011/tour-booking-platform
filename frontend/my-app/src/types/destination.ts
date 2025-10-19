import { PagingResponse } from ".";

export interface Destination {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  province: string;
}

export interface CreateDestinationDto {
  name: string;
  description: string;
  province: string;
  imageUrl: string;
}

export type DestinationPagingResponse = PagingResponse<Destination>;
