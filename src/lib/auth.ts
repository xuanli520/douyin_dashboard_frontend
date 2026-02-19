import { setSecureCookie, deleteCookie, getCookie } from './cookies';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token_storage';
const AUTH_TOKEN_COOKIE = 'auth_token';

export const ACCESS_TOKEN_EXPIRY = 1800;
export const REFRESH_BEFORE_EXPIRY = 60 * 29;
export const TOKEN_REFRESH_INTERVAL_MS = REFRESH_BEFORE_EXPIRY * 1000;

type TokenWithAccess = { access_token: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function appendQuery(url: string, key: string, value: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}

function getRefreshTokenFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const token = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  return token || null;
}

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}

export function setAccessToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

export function removeAccessToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function getRefreshToken(): string | null {
  const localToken = getRefreshTokenFromStorage();
  if (localToken) {
    return localToken;
  }
  if (typeof window !== 'undefined') {
    return getCookie(REFRESH_TOKEN_COOKIE);
  }
  return null;
}

export function setRefreshToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  }
  setSecureCookie(REFRESH_TOKEN_COOKIE, token);
}

export function removeRefreshToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
  deleteCookie(REFRESH_TOKEN_COOKIE);
}

export function clearTokens(): void {
  removeAccessToken();
  removeRefreshToken();
  deleteCookie(AUTH_TOKEN_COOKIE);
}

export function storeTokens(data: { access_token: string; refresh_token?: string }): void {
  setAccessToken(data.access_token);
  if (data.refresh_token) {
    setRefreshToken(data.refresh_token);
  }
  setSecureCookie(AUTH_TOKEN_COOKIE, data.access_token, 60 * 60 * 24);
}

export function buildRefreshTokenUrl(url: string): string {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return url;
  }
  return appendQuery(url, 'refresh_token', refreshToken);
}

export function normalizeTokenResponse<T extends TokenWithAccess>(response: unknown): T {
  if (isRecord(response) && isRecord(response.data)) {
    const wrapped = response.data;
    if (typeof wrapped.access_token === 'string') {
      return wrapped as T;
    }
  }

  if (isRecord(response) && typeof response.access_token === 'string') {
    return response as T;
  }

  throw new Error('Invalid token response');
}

export function isTokenExpiringSoon(expirySeconds: number = 60): boolean {
  const token = getAccessToken();
  if (!token) return true;

  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const exp = decoded.exp;

    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = exp - now;

    return timeUntilExpiry < expirySeconds;
  } catch {
    return true;
  }
}

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
