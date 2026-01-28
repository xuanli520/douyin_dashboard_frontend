// Token 管理模块
import { setCookie, deleteCookie, getCookie } from './cookies';

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
  deleteCookie(AUTH_TOKEN_COOKIE);
}

/**
 * 存储令牌
 */
export function storeTokens(data: { access_token: string; refresh_token?: string }): void {
  setAccessToken(data.access_token);
  // refresh_token 由后端设置在 HttpOnly Cookie 中
  if (data.refresh_token) {
    setCookie(REFRESH_TOKEN_COOKIE, data.refresh_token);
  }
  // 设置 auth_token cookie 供 middleware 验证（24小时过期）
  setCookie(AUTH_TOKEN_COOKIE, data.access_token, 60 * 60 * 24);
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
