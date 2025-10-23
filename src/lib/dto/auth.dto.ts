/**
 * Auth DTOs - Authentication and authorization data transfer objects
 */

export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}
