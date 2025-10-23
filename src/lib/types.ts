/**
 * Types - Legacy compatibility layer
 * This file re-exports all types from the organized structure
 * to maintain backward compatibility with existing imports
 */

// Re-export all DTOs
export type {
  User,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  Report,
  ReportCategory,
  ReportStatus,
  ReportComment,
  ReportStatusHistory,
  ReportsSearchParams,
  UpdateReportRequest,
  DashboardStats,
  PaginatedResponse,
  ApiError,
  ApiResponse,
} from './dto';

// Re-export all constants
export {
  STATUS_MAP,
  CATEGORY_MAP,
  STATUS_COLORS,
} from './constants';
