export type UserRole = "Admin" | "Customer" | "Partner";

export interface DecodedToken {
  nameid: string;
  email: string;
  name: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
}
export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface ApiUser {
  id: string;
  email: string;
  role: number;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
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
