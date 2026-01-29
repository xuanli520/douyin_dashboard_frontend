/**
 * API 配置集中管理
 * 所有 API 地址在此定义，便于维护和配置
 */

/** API 基础地址（相对路径） */
export const API_BASE_PATH = '/auth';

/** API 端点路径 */
export const API_ENDPOINTS = {
  // 认证相关
  JWT_LOGIN: '/auth/jwt/login',
  JWT_REFRESH: '/auth/jwt/refresh',
  JWT_LOGOUT: '/auth/jwt/logout',
  REGISTER: '/auth/register',

  // 用户管理
  USERS_ME: '/auth/users/me',
  USERS_BY_ID: (id: number) => `/auth/users/${id}`,

  // Admin Users
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: (id: number) => `/admin/users/${id}`,
  ADMIN_USER_ROLES: (id: number) => `/admin/users/${id}/roles`,

  // Admin Roles
  ADMIN_ROLES: '/admin/roles',
  ADMIN_ROLE_DETAIL: (id: number) => `/admin/roles/${id}`,
  ADMIN_ROLE_PERMISSIONS: (id: number) => `/admin/roles/${id}/permissions`,

  // Admin Permissions
  ADMIN_PERMISSIONS: '/admin/permissions',
} as const;

/** 成功响应状态码 */
export const SUCCESS_CODE = 200;

/** 默认请求超时时间（毫秒） */
export const DEFAULT_TIMEOUT = 30000;
