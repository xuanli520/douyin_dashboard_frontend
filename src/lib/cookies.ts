// Cookie 操作工具
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30天

/**
 * 设置 Cookie
 */
export function setCookie(name: string, value: string, maxAge: number = COOKIE_MAX_AGE): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * 获取 Cookie
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookie = parts.pop();
    if (cookie) {
      return decodeURIComponent(cookie.split(';').shift() || '');
    }
  }
  return null;
}

/**
 * 删除 Cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}
