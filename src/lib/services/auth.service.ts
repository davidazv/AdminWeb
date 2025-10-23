/**
 * Auth Service - Login and session management
 * Adapted to NestJS oFraud API backend
 */

import apiClient from "@/lib/api-client";
import { LoginRequest, LoginResponse } from "@/lib/dto";

export const authApi = {
  // Admin login endpoint
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log("=== INICIO LOGIN DEBUG ===");
    console.log("URL completa:", `${apiClient.defaults.baseURL}/auth/admin/login`);
    console.log("Credenciales enviadas:", credentials);
    console.log("Headers de axios:", apiClient.defaults.headers);

    try {
      const { data } = await apiClient.post<{ access_token: string; refresh_token: string; profile: any }>(
        "/auth/admin/login",
        credentials
      );

      console.log("✅ Respuesta exitosa del backend:", data);

      // Adapt backend response to frontend expected format
      const response = {
        access_token: data.access_token,
        user: data.profile,
      };

      console.log("✅ Respuesta adaptada:", response);
      return response;
    } catch (error: any) {
      console.log("❌ ERROR EN LOGIN:");
      console.log("Error completo:", error);
      console.log("Error message:", error.message);
      console.log("Error response:", error.response);
      console.log("Error response data:", error.response?.data);
      console.log("Error response status:", error.response?.status);
      console.log("Error response headers:", error.response?.headers);
      console.log("=== FIN LOGIN DEBUG ===");
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  getUser: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("user");
    }
    return null;
  },

  setUser: (user: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", user);
    }
  },

  isAuthenticated: (): boolean => {
    return !!authApi.getToken();
  },
};
