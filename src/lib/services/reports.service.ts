/**
 * Reports Service - CRUD operations for fraud reports
 * Adapted to oFraud API backend
 */

import apiClient from "@/lib/api-client";
import {
  Report,
  ReportsSearchParams,
  PaginatedResponse,
  UpdateReportRequest,
  DashboardStats,
  ReportComment,
  CreateCommentRequest,
} from "@/lib/dto";
import { CATEGORY_MAP, STATUS_MAP } from "@/lib/constants";

export const reportsApi = {
  // Dashboard stats - Calculate from ALL reports (admin view)
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Get ALL reports using admin endpoint
      const { data } = await apiClient.get<Report[]>("/reports/admin/all");

      // Calculate stats from reports
      const reportsByType: Record<number, number> = {};
      const reportsByStatus: Record<number, number> = {};
      const reportsByWeek: Record<string, number> = {};
      const reportsByMonth: Record<string, number> = {};
      const reportsByAdmin: Record<string, { count: number; resolved: number; pending: number }> = {};
      const acceptanceTrend: Record<string, { accepted: number; rejected: number; total: number }> = {};

      // Get current date
      const now = new Date();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const oneDay = 24 * 60 * 60 * 1000;
      
      // Initialize last 8 weeks with 0 counts
      for (let i = 7; i >= 0; i--) {
        const weekKey = `Sem ${8 - i}`;
        reportsByWeek[weekKey] = 0;
      }

      // Initialize last 12 months with 0 counts
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = monthDate.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
        reportsByMonth[monthKey] = 0;
      }

      // Initialize last 6 months for acceptance trend
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = monthDate.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
        acceptanceTrend[monthKey] = { accepted: 0, rejected: 0, total: 0 };
      }

      // Calculate response times by status
      const responseTimeData: Record<number, { totalDays: number; count: number }> = {};

      data.forEach((report: Report) => {
        // Count by category
        reportsByType[report.category_id] = (reportsByType[report.category_id] || 0) + 1;
        // Count by status
        reportsByStatus[report.status_id] = (reportsByStatus[report.status_id] || 0) + 1;
        
        const reportDate = new Date(report.created_at);
        const updatedDate = new Date(report.updated_at);

        // Count by week
        const weeksAgo = Math.floor((now.getTime() - reportDate.getTime()) / oneWeek);
        if (weeksAgo >= 0 && weeksAgo < 8) {
          const weekKey = `Sem ${8 - weeksAgo}`;
          if (reportsByWeek[weekKey] !== undefined) {
            reportsByWeek[weekKey]++;
          }
        }

        // Count by month
        const monthKey = reportDate.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
        if (reportsByMonth[monthKey] !== undefined) {
          reportsByMonth[monthKey]++;
        }

        // Count by admin (using admin names or IDs)
        const adminKey = report.assigned_admin_id ? `Admin ${report.assigned_admin_id}` : 'Sin asignar';
        if (!reportsByAdmin[adminKey]) {
          reportsByAdmin[adminKey] = { count: 0, resolved: 0, pending: 0 };
        }
        reportsByAdmin[adminKey].count++;
        
        if (report.status_id === 2 || report.status_id === 3) { // Aceptado o Rechazado
          reportsByAdmin[adminKey].resolved++;
        } else {
          reportsByAdmin[adminKey].pending++;
        }

        // Calculate response time for resolved reports
        if (report.status_id === 2 || report.status_id === 3) {
          const daysDiff = Math.floor((updatedDate.getTime() - reportDate.getTime()) / oneDay);
          if (!responseTimeData[report.status_id]) {
            responseTimeData[report.status_id] = { totalDays: 0, count: 0 };
          }
          responseTimeData[report.status_id].totalDays += daysDiff;
          responseTimeData[report.status_id].count++;
        }

        // Acceptance trend calculation
        const trendMonthKey = reportDate.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
        if (acceptanceTrend[trendMonthKey] !== undefined) {
          acceptanceTrend[trendMonthKey].total++;
          if (report.status_id === 2) { // Aceptado
            acceptanceTrend[trendMonthKey].accepted++;
          } else if (report.status_id === 3) { // Rechazado
            acceptanceTrend[trendMonthKey].rejected++;
          }
        }
      });

      return {
        totalReports: data.length,
        reportsByType: Object.entries(reportsByType).map(([categoryId, count]) => ({
          category: CATEGORY_MAP[Number(categoryId) as keyof typeof CATEGORY_MAP] || `Categoría ${categoryId}`,
          count,
        })),
        reportsByStatus: Object.entries(reportsByStatus).map(([statusId, count]) => ({
          status: STATUS_MAP[Number(statusId) as keyof typeof STATUS_MAP] || `Estado ${statusId}`,
          count,
        })),
        reportsByWeek: Object.entries(reportsByWeek).map(([week, count]) => ({
          week,
          count,
        })),
        reportsByMonth: Object.entries(reportsByMonth).map(([month, count]) => ({
          month,
          count,
        })),
        responseTime: Object.entries(responseTimeData).map(([statusId, data]) => ({
          status: STATUS_MAP[Number(statusId) as keyof typeof STATUS_MAP] || `Estado ${statusId}`,
          avgDays: data.count > 0 ? Math.round(data.totalDays / data.count) : 0,
          count: data.count,
        })),
        reportsByAdmin: Object.entries(reportsByAdmin)
          .filter(([_, data]) => data.count > 0)
          .map(([adminName, data]) => ({
            adminName,
            count: data.count,
            resolved: data.resolved,
            pending: data.pending,
          }))
          .sort((a, b) => b.count - a.count),
        acceptanceTrend: Object.entries(acceptanceTrend).map(([period, data]) => ({
          period,
          accepted: data.accepted,
          rejected: data.rejected,
          acceptanceRate: data.total > 0 ? Math.round((data.accepted / data.total) * 100) : 0,
          rejectionRate: data.total > 0 ? Math.round((data.rejected / data.total) * 100) : 0,
        })),
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalReports: 0,
        reportsByType: [],
        reportsByStatus: [],
        reportsByWeek: [],
        reportsByMonth: [],
        responseTime: [],
        reportsByAdmin: [],
        acceptanceTrend: [],
      };
    }
  },

  // Get ALL reports for admin (using admin endpoint)
  getAllReports: async (params?: ReportsSearchParams): Promise<Report[]> => {
    try {
      const backendParams: any = {};

      if (params?.category_id) backendParams.categoryId = params.category_id;
      if (params?.status_id) backendParams.statusId = params.status_id;
      if (params?.dateFrom) backendParams.dateFrom = params.dateFrom;
      if (params?.dateTo) backendParams.dateTo = params.dateTo;

      const { data } = await apiClient.get<Report[]>("/reports/admin/all", {
        params: backendParams
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching all reports:', error);
      return [];
    }
  },

  // Search/filter reports with pagination
  search: async (
    params: ReportsSearchParams
  ): Promise<PaginatedResponse<Report>> => {
    const reports = await reportsApi.getAllReports(params);

    // Client-side pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: reports.slice(startIndex, endIndex),
      total: reports.length,
      page,
      limit,
      totalPages: Math.ceil(reports.length / limit),
    };
  },

  // Get single report - Backend: GET /reports/:id
  getById: async (id: number): Promise<Report> => {
    const { data } = await apiClient.get<Report>(`/reports/${id}`);
    return data;
  },

  // Update report - Backend: PUT /reports/admin/:id (admin endpoint)
  update: async (
    id: number,
    updates: UpdateReportRequest
  ): Promise<Report> => {
    const { data } = await apiClient.put<Report>(`/reports/admin/${id}`, updates);
    return data;
  },

  // Update report as admin (allows all fields including assigned_admin_id)
  updateAsAdmin: async (
    id: number,
    updates: UpdateReportRequest
  ): Promise<Report> => {
    const { data } = await apiClient.put<Report>(`/reports/admin/${id}`, updates);
    return data;
  },

  // Delete report - Backend: DELETE /reports/:id
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/reports/${id}`);
  },

  // Accept report - Update status to Aceptado (status_id = 2) and assign random admin
  accept: async (id: number): Promise<Report> => {
    // Lista de administradores disponibles (puedes modificar estos IDs según tu sistema)
    const availableAdmins = [1, 2, 3];
    
    // Seleccionar un administrador aleatorio
    const randomAdminId = availableAdmins[Math.floor(Math.random() * availableAdmins.length)];
    
    const { data } = await apiClient.put<Report>(`/reports/admin/${id}`, {
      status_id: 2,
      assigned_admin_id: randomAdminId
    });
    return data;
  },

  // Reject report - Update status to Rechazado (status_id = 3)
  reject: async (id: number): Promise<Report> => {
    const { data } = await apiClient.put<Report>(`/reports/admin/${id}`, {
      status_id: 3
    });
    return data;
  },

  // Upload attachment - Backend: POST /files/upload
  uploadAttachment: async (id: number, file: File): Promise<Report> => {
    const formData = new FormData();
    formData.append("file", file);

    // First upload the file
    const { data: uploadResponse } = await apiClient.post<{ url: string; fileKey: string }>(
      `/files/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Then update the report with the file URL (using admin endpoint)
    const { data } = await apiClient.put<Report>(
      `/reports/admin/${id}`,
      { evidence_url: uploadResponse.url }
    );
    return data;
  },

  // Get next pending report (for workflow)
  getNextPending: async (): Promise<Report | null> => {
    try {
      const reports = await reportsApi.getAllReports({ status_id: 1, limit: 1 });
      return reports[0] || null;
    } catch {
      return null;
    }
  },

  // Assign report to admin - using direct approach to avoid DTO validation issues
  assignToAdmin: async (reportId: number, adminId: number): Promise<Report> => {
    // First update status and other fields without assigned_admin_id
    const { data } = await apiClient.put<Report>(`/reports/admin/${reportId}`, {
      assigned_admin_id: adminId
    });
    return data;
  },

  // Create new report with optional file upload
  create: async (reportData: {
    title: string;
    description: string;
    category_id: number;
    incident_date?: string;
    location?: string;
    fraud_contact?: string;
    is_anonymous?: boolean;
  }, file?: File): Promise<Report> => {
    let evidence_url: string | undefined;

    // First upload file if provided
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const { data: uploadResponse } = await apiClient.post<{ url: string; fileKey: string }>(
        `/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      evidence_url = uploadResponse.url;
    }

    // Then create the report
    const { data } = await apiClient.post<Report>(`/reports`, {
      ...reportData,
      evidence_url,
    });
    return data;
  },

  // Create guest report with optional file upload  
  createGuest: async (reportData: {
    title: string;
    description: string;
    category_id: number;
    incident_date?: string;
    location?: string;
    fraud_contact?: string;
  }, file?: File): Promise<Report> => {
    let evidence_url: string | undefined;

    // First upload file if provided
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const { data: uploadResponse } = await apiClient.post<{ url: string; fileKey: string }>(
        `/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      evidence_url = uploadResponse.url;
    }

    // Then create the guest report (always anonymous)
    const { data } = await apiClient.post<Report>(`/reports/guest`, {
      ...reportData,
      evidence_url,
      is_anonymous: true,
    });
    return data;
  },

  // ============================================
  // COMENTARIOS
  // ============================================

  // Get comments for a report
  getComments: async (reportId: number): Promise<ReportComment[]> => {
    const { data } = await apiClient.get<ReportComment[]>(`/reports/${reportId}/comments`);
    return data;
  },

  // Add comment to a report
  addComment: async (reportId: number, commentData: CreateCommentRequest): Promise<ReportComment> => {
    const { data } = await apiClient.post<ReportComment>(`/reports/${reportId}/comments`, commentData);
    return data;
  },

  // Update a comment
  updateComment: async (commentId: number, commentData: CreateCommentRequest): Promise<ReportComment> => {
    const { data } = await apiClient.put<ReportComment>(`/reports/comments/${commentId}`, commentData);
    return data;
  },

  // Delete a comment
  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(`/reports/comments/${commentId}`);
  },

  // Accept report with optional comment
  acceptWithComment: async (id: number, comment?: string, isInternal?: boolean): Promise<Report> => {
    // Lista de administradores disponibles (puedes modificar estos IDs según tu sistema)
    const availableAdmins = [1, 2, 3];
    
    // Seleccionar un administrador aleatorio
    const randomAdminId = availableAdmins[Math.floor(Math.random() * availableAdmins.length)];
    
    const { data } = await apiClient.put<Report>(`/reports/admin/${id}`, {
      status_id: 2,
      assigned_admin_id: randomAdminId
    });

    // Agregar comentario si se proporcionó
    if (comment && comment.trim()) {
      await reportsApi.addComment(id, {
        comment: comment.trim(),
        is_internal: isInternal || false
      });
    }

    return data;
  },

  // Reject report with optional comment
  rejectWithComment: async (id: number, comment?: string, isInternal?: boolean): Promise<Report> => {
    const { data } = await apiClient.put<Report>(`/reports/admin/${id}`, {
      status_id: 3
    });

    // Agregar comentario si se proporcionó
    if (comment && comment.trim()) {
      await reportsApi.addComment(id, {
        comment: comment.trim(),
        is_internal: isInternal || false
      });
    }

    return data;
  },
};
