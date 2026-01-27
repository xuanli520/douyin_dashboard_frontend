// 认证 API 模块
import { post, get, del, patch } from './api';
import { setCookie, deleteCookie, getCookie } from './cookies';

// 认证相关类型
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
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
  password_confirm: string;
}

// 错误码映射
export const ERROR_CODES: Record<number, string> = {
  10001: '无效凭证',
  10002: '无效密码',
  10004: 'Token无效',
  10005: '账户已锁定',
  20001: '用户不存在',
  20003: '用户未激活',
  30001: '权限不足',
  30002: '角色不足',
};

const ERROR_MSG_MAP: Record<string, string> = {
  REGISTER_USER_ALREADY_EXISTS: '用户已存在',
  REGISTER_INVALID_EMAIL: '邮箱格式错误',
};

// API 基础地址 (通过 Next.js 代理)
const AUTH_API = '/auth';

// 存储键
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const AUTH_TOKEN_COOKIE = 'auth_token';

// Token 有效期配置 (秒)
export const ACCESS_TOKEN_EXPIRY = 1800; // 30分钟
export const REFRESH_BEFORE_EXPIRY = 60 * 29; // 29分钟后刷新

// ============ Token 管理 ============

/**
 * 获取访问令牌
 */
export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}

/**
 * 设置访问令牌
 */
export function setAccessToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

/**
 * 移除访问令牌
 */
export function removeAccessToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

/**
 * 获取刷新令牌 (从 HttpOnly Cookie)
 */
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return getCookie(REFRESH_TOKEN_COOKIE);
  }
  return null;
}

/**
 * 清除所有令牌
 */
export function clearTokens(): void {
  removeAccessToken();
  deleteCookie(REFRESH_TOKEN_COOKIE);
}

/**
 * 存储令牌
 */
export function storeTokens(data: TokenResponse): void {
  setAccessToken(data.access_token);
  // refresh_token 由后端设置在 HttpOnly Cookie 中
}

/**
 * 检查 Token 是否即将过期 (在指定秒数内)
 */
export function isTokenExpiringSoon(expirySeconds: number = 60): boolean {
  const token = getAccessToken();
  if (!token) return true;

  try {
    // JWT payload 格式: base64Url(header).base64Url(payload).signature
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const exp = decoded.exp;

    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = exp - now;

    return timeUntilExpiry < expirySeconds;
  } catch {
    // 解析失败，假设需要刷新
    return true;
  }
}

/**
 * 获取 Token 剩余有效时间 (秒)
 */
export function getTokenTimeRemaining(): number {
  const token = getAccessToken();
  if (!token) return 0;

  try {
    const payload = token.split('.')[1];
    if (!payload) return 0;

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const exp = decoded.exp;

    if (!exp) return 0;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, exp - now);
  } catch {
    return 0;
  }
}

// ============ 认证 API ============

/**
 * 登录
 */
export async function login(params: LoginParams): Promise<TokenResponse> {
  // OAuth2PasswordRequestForm 格式
  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('username', params.username);
  formData.append('password', params.password);
  if (params.captchaVerifyParam) {
    formData.append('captcha_verify_param', params.captchaVerifyParam);
  }

  const response = await post<TokenResponse>(
    `${AUTH_API}/jwt/login`,
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  storeTokens(response);

  // 设置 auth_token cookie 供 middleware 验证（24小时过期）
  setCookie(AUTH_TOKEN_COOKIE, response.access_token, 60 * 60 * 24);

  return response;
}

/**
 * 刷新访问令牌
 */
export async function refreshToken(): Promise<{ access_token: string; token_type: string }> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await post<{ access_token: string; token_type: string }>(
    `${AUTH_API}/jwt/refresh`,
    { refresh_token: refreshToken }
  );

  setAccessToken(response.access_token);
  return response;
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await del(`${AUTH_API}/jwt/logout`, {
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // 即使请求失败也要清除本地令牌
    }
  }
  clearTokens();
  deleteCookie(AUTH_TOKEN_COOKIE);
}

/**
 * 注册
 */
export async function register(params: RegisterParams): Promise<User> {
  return post<User>(`${AUTH_API}/register`, params);
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<User> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  return get<User>(`${AUTH_API}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 更新当前用户信息
 */
export async function updateCurrentUser(data: Partial<User> & { password?: string }): Promise<User> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  return patch<User>(`${AUTH_API}/users/me`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 更新用户信息 (通过ID)
 */
export async function updateUser(userId: number, data: Partial<User> & { password?: string }): Promise<User> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  return patch<User>(`${AUTH_API}/users/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 处理认证错误
 */
export function handleAuthError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as any).code;
    if (code && ERROR_CODES[code]) {
      return ERROR_CODES[code];
    }
    const rawMessage = error.message;
    if (ERROR_MSG_MAP[rawMessage]) {
      return ERROR_MSG_MAP[rawMessage];
    }
    const data = (error as any).data;
    if (data?.validation_errors?.length) {
      const first = data.validation_errors[0];
      if (first?.message) return first.message;
    }
    const match = error.message.match(/(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (ERROR_CODES[parsed]) {
        return ERROR_CODES[parsed];
      }
    }
    return error.message;
  }
  return '未知错误';
}

// ============ 请求拦截器 ============

/**
 * 带自动刷新的请求函数
 * 主动检测 Token 即将过期时先刷新再请求
 */
export async function authRequest<T>(
  request: () => Promise<T>,
  options?: {
    forceRefresh?: boolean; // 强制刷新 token
    onRefresh?: () => void;
  }
): Promise<T> {
  const { forceRefresh = false, onRefresh } = options || {};

  // 检查 token 是否即将过期
  if (forceRefresh || isTokenExpiringSoon(REFRESH_BEFORE_EXPIRY)) {
    try {
      await refreshToken();
      onRefresh?.();
    } catch (refreshError) {
      // 刷新失败，清除 token
      clearTokens();
      throw new Error('会话已过期，请重新登录');
    }
  }

  try {
    return await request();
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('Token')) {
      try {
        await refreshToken();
        onRefresh?.();
        return await request();
      } catch {
        clearTokens();
        throw new Error('会话已过期，请重新登录');
      }
    }
    throw error;
  }
}
