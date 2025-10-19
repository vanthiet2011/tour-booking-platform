export type UserRole = "Customer" | "Admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
  iss: string;
  aud: string;
}
