/**
 * API 配置集中管理
 * 所有 API 地址在此定义，便于维护和配置
 */

/** API 基础地址（相对路径） */
export const API_BASE_PATH = '/v1';

/** API 端点路径 */
export const API_ENDPOINTS = {
  // 认证相关
  JWT_LOGIN: '/v1/auth/jwt/login',
  JWT_REFRESH: '/v1/auth/jwt/refresh',
  JWT_LOGOUT: '/v1/auth/jwt/logout',
  REGISTER: '/v1/auth/register',

  // 用户管理
  USERS_ME: '/v1/auth/users/me',
  USERS_BY_ID: (id: number) => `/v1/auth/users/${id}`,

  // Admin Users
  ADMIN_USERS: '/v1/admin/users',
  ADMIN_USER_DETAIL: (id: number) => `/v1/admin/users/${id}`,
  ADMIN_USER_ROLES: (id: number) => `/v1/admin/users/${id}/roles`,

  // Admin Roles
  ADMIN_ROLES: '/v1/admin/roles',
  ADMIN_ROLE_DETAIL: (id: number) => `/v1/admin/roles/${id}`,
  ADMIN_ROLE_PERMISSIONS: (id: number) => `/v1/admin/roles/${id}/permissions`,

  // Admin Permissions
  ADMIN_PERMISSIONS: '/v1/admin/permissions',
} as const;

/** 成功响应状态码 */
export const SUCCESS_CODE = 200;

/** 默认请求超时时间（毫秒） */
export const DEFAULT_TIMEOUT = 30000;
