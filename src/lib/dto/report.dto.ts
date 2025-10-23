/**
 * Report DTOs - Report-related data transfer objects
 */

export interface Report {
  id: number;
  user_id: number;
  category_id: number;
  status_id: number;
  title: string;
  description: string;
  incident_date: string | null;
  location: string | null;
  evidence_url: string | null;
  assigned_admin_id: number | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportCategory {
  id: number;
  name: string;
  description: string;
  type: 'url' | 'app' | 'telefono' | 'email' | 'presencial';
  is_active: boolean;
}

export interface ReportStatus {
  id: number;
  name: string;
  description: string;
}

export interface ReportComment {
  id: number;
  report_id: number;
  admin_id: number;
  admin_name?: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  comment: string;
  is_internal?: boolean;
}

export interface ReportStatusHistory {
  id: number;
  report_id: number;
  previous_status_id: number | null;
  new_status_id: number;
  changed_by_admin_id: number;
  comment: string | null;
  created_at: string;
}

export interface ReportsSearchParams {
  id?: string;
  status_id?: number | '';
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  category_id?: number | '';
  page?: number;
  limit?: number;
}

export interface UpdateReportRequest {
  title?: string;
  description?: string;
  category_id?: number;
  status_id?: number;
  incident_date?: string;
  location?: string;
  evidence_url?: string;
  assigned_admin_id?: number;
}

export interface DashboardStats {
  reportsByType: {
    category: string;
    count: number;
  }[];
  reportsByStatus: {
    status: string;
    count: number;
  }[];
  reportsByWeek: {
    week: string;
    count: number;
  }[];
  reportsByMonth: {
    month: string;
    count: number;
  }[];
  responseTime: {
    status: string;
    avgDays: number;
    count: number;
  }[];
  reportsByAdmin: {
    adminName: string;
    count: number;
    resolved: number;
    pending: number;
  }[];
  acceptanceTrend: {
    period: string;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
    rejectionRate: number;
  }[];
  totalReports: number;
}
