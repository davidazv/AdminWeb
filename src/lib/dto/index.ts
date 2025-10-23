/**
 * DTOs Index - Central export for all data transfer objects
 */

// Auth DTOs
export type {
  User,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './auth.dto';

// Report DTOs
export type {
  Report,
  ReportCategory,
  ReportStatus,
  ReportComment,
  ReportStatusHistory,
  ReportsSearchParams,
  UpdateReportRequest,
  DashboardStats,
} from './report.dto';

// Common DTOs
export type {
  PaginatedResponse,
  ApiError,
  ApiResponse,
} from './common.dto';
