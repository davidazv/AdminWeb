import { apiClient } from "@/lib/api-client";
import { HelpRequest, CreateHelpRequest, RespondHelpRequest } from "@/lib/types/help.types";

export const helpApi = {
  // Para usuarios
  createRequest: async (data: CreateHelpRequest): Promise<HelpRequest> => {
    const response = await apiClient.post("/help-requests", data);
    return response.data;
  },

  getMyRequests: async (): Promise<HelpRequest[]> => {
    const response = await apiClient.get("/help-requests/my-requests");
    return response.data;
  },

  // Para administradores
  getAllRequests: async (): Promise<HelpRequest[]> => {
    const response = await apiClient.get("/help-requests/admin/all");
    return response.data;
  },

  getPendingRequests: async (): Promise<HelpRequest[]> => {
    const response = await apiClient.get("/help-requests/admin/pending");
    return response.data;
  },

  getRequestById: async (id: number): Promise<HelpRequest> => {
    const response = await apiClient.get(`/help-requests/${id}`);
    return response.data;
  },

  respondToRequest: async (id: number, data: RespondHelpRequest): Promise<HelpRequest> => {
    const response = await apiClient.patch(`/help-requests/${id}/respond`, data);
    return response.data;
  },

  assignRequest: async (id: number): Promise<HelpRequest> => {
    const response = await apiClient.patch(`/help-requests/${id}/assign`);
    return response.data;
  },
};