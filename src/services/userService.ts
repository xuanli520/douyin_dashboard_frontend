/**
 * 用户 API 服务层
 *
 * 提供用户认证、用户管理等 API 调用功能。
 * 所有 API 响应采用统一的包装格式 { code, msg, data }。
 *
 * @module userService
 */

import { authPost, authGet, authPatch, authDel } from '@/lib/api-client';
import { post } from '@/lib/api';
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  clearTokens,
  storeTokens,
} from '@/lib/auth';
import {
  type User,
  type UserUpdate,
  type UserUpdateMe,
  type TokenResponse,
  type LoginParams,
  type RegisterParams,
  type PasswordStrength,
  AUTH_ERROR_CODES,
} from '@/types/user';
import { API_ENDPOINTS, SUCCESS_CODE } from '@/config/api';

// ============ 类型定义 ============

/**
 * 后端统一响应格式
 */
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 网络错误类
 */
export class NetworkError extends Error {
  constructor(message: string = '网络请求失败，请检查网络连接') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * 超时错误类
 */
export class TimeoutError extends Error {
  constructor(message: string = '请求超时，请稍后重试') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  code?: number;
  data?: unknown;

  constructor(message: string, code?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}

// ============ 通用请求函数 ============

/**
 * 通用请求处理函数
 *
 * 统一处理 GET/POST/PATCH/DELETE 请求的响应包装格式验证。
 * 减少代码重复，提供统一的错误处理逻辑。
 *
 * @param url - 请求地址
 * @param method - HTTP 方法
 * @param data - 请求体数据（可选）
 * @param options - 其他请求选项
 * @returns 解析后的响应数据
 * @throws {ApiError} 当响应状态码不为 200 时抛出
 * @throws {NetworkError} 当发生网络错误时抛出
 * @throws {TimeoutError} 当请求超时时抛出
 */
async function wrappedRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  let response: ApiResponse<T>;

  switch (method) {
    case 'GET':
      response = await authGet<ApiResponse<T>>(url, options);
      break;
    case 'POST':
      response = await authPost<ApiResponse<T>>(url, data, options);
      break;
    case 'PATCH':
      response = await authPatch<ApiResponse<T>>(url, data, options);
      break;
    case 'DELETE':
      response = await authDel<ApiResponse<T>>(url, options);
      break;
  }

  // 验证响应状态码
  if (response.code !== SUCCESS_CODE) {
    throw new ApiError(
      response.msg || `请求失败: ${response.code}`,
      response.code,
      response.data
    );
  }

  return response.data;
}

// 便捷方法（保持向后兼容）
async function wrappedGet<T>(url: string, options?: RequestInit): Promise<T> {
  return wrappedRequest<T>(url, 'GET', undefined, options);
}

async function wrappedPost<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
  return wrappedRequest<T>(url, 'POST', data, options);
}

async function wrappedPatch<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
  return wrappedRequest<T>(url, 'PATCH', data, options);
}

async function wrappedDel<T>(url: string, options?: RequestInit): Promise<T> {
  return wrappedRequest<T>(url, 'DELETE', undefined, options);
}

// ============ Token 刷新竞态处理 ============

/**
 * Token 刷新 promise 缓存
 * 用于防止并发刷新请求导致的竞态条件
 */
let refreshTokenPromise: Promise<{ access_token: string; token_type: string }> | null = null;

/**
 * 刷新访问令牌
 *
 * 使用 Promise 缓存机制避免并发刷新时的竞态条件。
 * 多个同时调用会共享同一个刷新请求。
 *
 * @returns 刷新后的 token 响应
 * @throws {Error} 当没有可用的 refresh token 时抛出
 * @throws {ApiError} 当刷新请求失败时抛出
 */
export async function refreshToken(): Promise<{ access_token: string; token_type: string }> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('无法获取刷新令牌，请重新登录');
  }

  // 如果已有刷新请求正在进行中，返回同一个 Promise
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  // 创建新的刷新请求
  refreshTokenPromise = (async () => {
    try {
      const response = await post<{ access_token: string; token_type: string }>(
        `${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(refreshTokenValue)}`
      );

      // 更新本地存储的 token
      setAccessToken(response.access_token);
      // 设置 auth_token cookie 供 middleware 验证
      if (typeof document !== 'undefined') {
        document.cookie = `auth_token=${response.access_token}; path=/; max-age=${60 * 60 * 24}`;
      }

      return response;
    } finally {
      // 请求完成后清除缓存，允许下次刷新
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
}

// ============ 认证相关 ============

/**
 * 用户登录
 *
 * @param params - 登录参数（用户名、密码、可选的验证码）
 * @returns Token 响应（包含 access_token 和 refresh_token）
 * @throws {ApiError} 当登录失败时抛出
 */
export async function login(params: LoginParams): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append('username', params.username);
  formData.append('password', params.password);
  if (params.captchaVerifyParam) {
    formData.append('captchaVerifyParam', params.captchaVerifyParam);
  }

  const response = await authPost<TokenResponse>(
    API_ENDPOINTS.JWT_LOGIN,
    formData,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  storeTokens(response);
  return response;
}

/**
 * 用户登出
 *
 * 调用后端登出接口并清除本地令牌。
 * 无论后端调用是否成功，都会清除本地状态。
 */
export async function logout(): Promise<void> {
  const refreshTokenValue = getRefreshToken();

  if (refreshTokenValue) {
    try {
      await post<ApiResponse<null>>(
        `${API_ENDPOINTS.JWT_LOGOUT}?refresh_token=${encodeURIComponent(refreshTokenValue)}`
      );
    } catch {
      // 即使请求失败也要清除本地令牌
    }
  }

  clearTokens();

  // 强制刷新页面以确保完全清除所有状态
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * 用户注册
 *
 * @param params - 注册参数
 * @returns 注册创建的用户信息
 * @throws {ApiError} 当注册失败时抛出
 */
export async function register(params: RegisterParams): Promise<User> {
  return wrappedPost<User>(API_ENDPOINTS.REGISTER, params);
}

// ============ 用户管理 ============

/**
 * 获取当前登录用户信息
 *
 * @returns 当前用户信息
 * @throws {ApiError} 当获取失败时抛出
 */
export async function getCurrentUser(): Promise<User> {
  return wrappedGet<User>(API_ENDPOINTS.USERS_ME);
}

/**
 * 更新当前用户信息
 *
 * @param data - 要更新的用户信息
 * @returns 更新后的用户信息
 * @throws {ApiError} 当更新失败时抛出
 */
export async function updateCurrentUser(data: UserUpdateMe): Promise<User> {
  return wrappedPatch<User>(API_ENDPOINTS.USERS_ME, data);
}

/**
 * 根据 ID 获取用户信息
 *
 * @param id - 用户 ID
 * @returns 指定用户信息
 * @throws {ApiError} 当获取失败时抛出
 */
export async function getUserById(id: number): Promise<User> {
  return wrappedGet<User>(API_ENDPOINTS.USERS_BY_ID(id));
}

/**
 * 更新指定用户信息
 *
 * @param id - 要更新的用户 ID
 * @param data - 要更新的用户信息
 * @returns 更新后的用户信息
 * @throws {ApiError} 当更新失败时抛出
 */
export async function updateUser(id: number, data: UserUpdate): Promise<User> {
  return wrappedPatch<User>(API_ENDPOINTS.USERS_BY_ID(id), data);
}

/**
 * 删除指定用户
 *
 * @param id - 要删除的用户 ID
 * @throws {ApiError} 当删除失败时抛出
 */
export async function deleteUser(id: number): Promise<void> {
  await wrappedDel(API_ENDPOINTS.USERS_BY_ID(id));
}

/**
 * 检查当前用户是否为超级管理员
 *
 * @returns 是否为超级管理员
 */
export async function checkIsSuperuser(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user.is_superuser;
  } catch {
    return false;
  }
}

// ============ 错误处理 ============

/**
 * 错误消息映射表
 * 将后端返回的错误键映射为用户友好的中文提示
 */
const ERROR_MSG_MAP: Record<string, string> = {
  REGISTER_USER_ALREADY_EXISTS: '用户已存在',
  REGISTER_INVALID_EMAIL: '邮箱格式错误',
};

/**
 * 处理认证错误
 *
 * 将后端错误转换为用户友好的错误信息。
 * 支持多种错误格式：错误码、预设映射、验证错误等。
 *
 * @param error - 原始错误对象
 * @returns 用户友好的错误信息
 */
export function handleAuthError(error: unknown): string {
  if (error instanceof Error) {
    const err = error as Error & { code?: number; data?: { validation_errors?: Array<{ message?: string }> } };
    const code = err.code;

    // 1. 根据错误码查找预设消息
    if (code && AUTH_ERROR_CODES[code as keyof typeof AUTH_ERROR_CODES]) {
      return AUTH_ERROR_CODES[code as keyof typeof AUTH_ERROR_CODES];
    }

    // 2. 查找预设的错误消息映射
    const rawMessage = error.message;
    if (ERROR_MSG_MAP[rawMessage]) {
      return ERROR_MSG_MAP[rawMessage];
    }

    // 3. 处理验证错误
    const data = err.data;
    if (data?.validation_errors?.length) {
      const first = data.validation_errors[0];
      if (first?.message) return first.message;
    }

    // 4. 从错误消息中提取错误码
    const match = error.message.match(/(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (AUTH_ERROR_CODES[parsed as keyof typeof AUTH_ERROR_CODES]) {
        return AUTH_ERROR_CODES[parsed as keyof typeof AUTH_ERROR_CODES];
      }
    }

    return error.message;
  }
  return '未知错误';
}

// ============ 密码强度验证 ============

/**
 * 检查密码强度
 *
 * 评估密码是否符合安全要求，返回强度等级和详细的规则检查结果。
 * 强度等级：弱（0-2个规则）、中等（3-4个规则）、强（5个规则）
 *
 * @param password - 要检查的密码
 * @returns 密码强度评估结果（包含分数、标签、颜色和规则详情）
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  // 处理空密码或 undefined
  if (!password || password.length === 0) {
    return {
      score: 0,
      label: '弱',
      color: 'bg-red-500',
      requirements: {
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
      },
    };
  }

  const requirements = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  let score: number;
  let label: '弱' | '中等' | '强';
  let color: string;

  if (metCount <= 2) {
    score = 0;
    label = '弱';
    color = 'bg-red-500';
  } else if (metCount <= 4) {
    score = 2;
    label = '中等';
    color = 'bg-yellow-500';
  } else {
    score = 4;
    label = '强';
    color = 'bg-green-500';
  }

  return { score, label, color, requirements };
}

// 导出类型供外部使用
export type { ApiResponse, NetworkError, TimeoutError, ApiError };
