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
} as const;

/** 成功响应状态码 */
export const SUCCESS_CODE = 200;

/** 默认请求超时时间（毫秒） */
export const DEFAULT_TIMEOUT = 30000;
