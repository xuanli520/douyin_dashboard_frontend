import { ApiResponse, PaginatedData, PageMeta } from '@/lib/http/types';

export type { PaginatedData, PageMeta };

export * from './permission';
export * from './endpoint';

export type DataSourceType = 'DOUYIN_API' | 'DOUYIN_SHOP' | 'DOUYIN_APP' | 'FILE_IMPORT' | 'FILE_UPLOAD' | 'SELF_HOSTED';
export type DataSourceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';
export type TargetType = 'SHOP_OVERVIEW' | 'TRAFFIC' | 'PRODUCT' | 'LIVE' | 'CONTENT_VIDEO' | 'ORDER_FULFILLMENT' | 'AFTERSALE_REFUND' | 'CUSTOMER' | 'ADS';
export type ScrapingRuleStatus = 'ACTIVE' | 'INACTIVE';
export type ScheduleType = 'cron' | 'interval' | 'once';
export type ImportStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'CANCELLED' | 'VALIDATION_FAILED';

export interface DataSourceConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  [key: string]: unknown;
}

export interface DataSource {
  id: number;
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  status: DataSourceStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DataSourceCreate {
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  status?: DataSourceStatus;
  description?: string;
}

export interface DataSourceUpdate {
  name?: string;
  type?: DataSourceType;
  config?: DataSourceConfig;
  status?: DataSourceStatus;
  description?: string;
}

export interface DataSourceResponse {
  id: number;
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  status: DataSourceStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type PaginatedDataSourceResponse = PaginatedData<DataSourceResponse>;

export interface ScrapingRuleConfig {
  target_url?: string;
  selectors?: Record<string, string>;
  max_pages?: number;
  concurrency?: number;
  retry_count?: number;
  timeout?: number;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  [key: string]: unknown;
}

export interface ScrapingRule {
  id: number;
  data_source_id: number;
  name: string;
  target_type: TargetType;
  config: ScrapingRuleConfig;
  schedule?: string;
  schedule_type?: ScheduleType;
  schedule_value?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  data_source_name?: string;
  last_run_at?: string;
}

export interface ScrapingRuleResponse {
  id: number;
  data_source_id: number;
  name: string;
  target_type: TargetType;
  config: ScrapingRuleConfig;
  schedule?: string;
  schedule_type?: ScheduleType;
  schedule_value?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ScrapingRuleListItem {
  id: number;
  data_source_id: number;
  name: string;
  target_type: TargetType;
  config: ScrapingRuleConfig;
  schedule?: string;
  schedule_type?: ScheduleType;
  schedule_value?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  data_source_name?: string;
}

export interface ScrapingRuleCreate {
  data_source_id: number;
  name: string;
  target_type: TargetType;
  config: ScrapingRuleConfig;
  schedule?: string;
  is_active?: boolean;
  description?: string;
}

export interface ScrapingRuleUpdate {
  name?: string;
  target_type?: TargetType;
  config?: ScrapingRuleConfig;
  schedule?: string;
  is_active?: boolean;
  description?: string;
}

export type PaginatedScrapingRuleListItem = PaginatedData<ScrapingRuleListItem>;

export interface ImportUploadResponse {
  id: number;
  file_name: string;
  file_size: number;
  status: ImportStatus;
  created_at: string;
}

export interface ImportParseResponse {
  id: number;
  total_rows: number;
  preview: Record<string, unknown>[];
}

export interface FieldMappingRequest {
  mappings: Record<string, string>;
  target_fields: string[];
}

export interface ImportMappingResponse {
  id: number;
  status: ImportStatus;
}

export interface ImportValidateResponse {
  id: number;
  total_rows: number;
  passed: number;
  failed: number;
  errors_by_field: Record<string, number>;
  warnings_by_field: Record<string, number>;
}

export interface ImportConfirmResponse {
  id: number;
  total: number;
  success: number;
  failed: number;
  errors: Record<string, unknown>[];
}

export interface ImportCancelResponse {
  id: number;
  status: ImportStatus;
  message: string;
}

export interface ImportDetailResponse {
  id: number;
  file_name: string;
  file_size: number;
  status: ImportStatus;
  field_mapping?: Record<string, string>;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface ImportHistoryItem {
  id: number;
  file_name: string;
  status: ImportStatus;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  created_at: string;
}

export type PaginatedImportHistoryItem = PaginatedData<ImportHistoryItem>;

export interface PermissionRead {
  id: number;
  code: string;
  name: string;
  description?: string;
  module: string;
  created_at: string;
  updated_at: string;
}

export type PaginatedPermissionRead = PaginatedData<PermissionRead>;

export interface RoleRead {
  id: number;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleWithPermissions extends RoleRead {
  permissions: PermissionRead[];
}

export interface RoleCreate {
  name: string;
  description?: string;
}

export interface RoleUpdate {
  name?: string;
  description?: string;
}

export interface PermissionAssign {
  permission_ids: number[];
}

export type PaginatedRoleRead = PaginatedData<RoleRead>;

export interface UserRead {
  id: number;
  email: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  username: string;
  gender?: string;
  phone?: string;
  department?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  username: string;
  gender?: string;
  phone?: string;
  department?: string;
}

export interface UserUpdate {
  password?: string;
  email?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  username?: string;
  gender?: string;
  phone?: string;
  department?: string;
}

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  gender?: string;
  phone?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  roles: RoleRead[];
}

export interface UserCreateByAdmin {
  username: string;
  email: string;
  password: string;
  gender?: string;
  phone?: string;
  department?: string;
  role_ids?: number[];
}

export interface UserUpdateByAdmin {
  username?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  gender?: string;
  phone?: string;
  department?: string;
  role_ids?: number[];
}

export interface UserStatsResponse {
  total: number;
  active: number;
  inactive: number;
  superusers: number;
}

export type PaginatedUserListItem = PaginatedData<UserListItem>;

export interface AssignRolesRequest {
  role_ids: number[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: 'Bearer';
}

export interface MessageResponse {
  detail: string;
}

export interface ErrorModel {
  detail: string | Record<string, string>;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface LoginParams {
  username: string;
  password: string;
  captchaVerifyParam?: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ResetPasswordParams {
  token: string;
  password: string;
}

export interface VerifyTokenParams {
  token: string;
}

export interface RequestVerifyTokenParams {
  email: string;
}

export type Response<T> = ApiResponse<T>;
export type ResponseData<T> = T;

export * from './audit';
