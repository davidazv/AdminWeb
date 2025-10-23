/**
 * API Client - Axios configuration with interceptors for JWT auth
 * Adaptable to OpenAPI spec when available at /api-json
 */

import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: add JWT token
apiClient.interceptors.request.use(
  (config) => {
    console.log("🔄 Request interceptor ejecutado:");
    console.log("URL:", config.url);
    console.log("Method:", config.method);
    console.log("BaseURL:", config.baseURL);
    console.log("Data:", config.data);
    
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token agregado:", token.substring(0, 20) + "...");
    } else {
      console.log("📝 No hay token almacenado");
    }
    
    console.log("📤 Headers finales:", config.headers);
    return config;
  },
  (error) => {
    console.log("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
