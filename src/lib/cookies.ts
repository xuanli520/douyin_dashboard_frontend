// Cookie 操作工具
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30天

/**
 * 获取当前环境是否为生产环境
 */
function isProduction(): boolean {
  const result = process.env.NEXT_PUBLIC_IS_PROD === 'true';
  console.log('[Cookie] isProduction:', result, 'NEXT_PUBLIC_IS_PROD:', process.env.NEXT_PUBLIC_IS_PROD);
  return result;
}

/**
 * 设置 Cookie
 * @param name - Cookie 名称
 * @param value - Cookie 值
 * @param maxAge - Cookie 最大存活时间（秒），默认30天
 * @param options - 额外的 Cookie 选项
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number = COOKIE_MAX_AGE,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  if (typeof document === 'undefined') return;

  const {
    httpOnly = false, // 客户端 JavaScript 无法设置 httpOnly cookie，需要服务端设置
    secure = isProduction(), // 生产环境强制使用 secure
    sameSite = isProduction() ? 'strict' : 'lax', // 开发环境使用 lax 以支持 HTTP
  } = options;

  // 构建 cookie 字符串
  let cookieString = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;

  // SameSite 属性
  cookieString += `; SameSite=${sameSite.charAt(0).toUpperCase() + sameSite.slice(1)}`;

  // Secure 属性（仅在 HTTPS 或生产环境）
  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
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

/**
 * 设置安全的认证 Cookie（用于 auth_token）
 * 注意：真正的 httpOnly cookie 需要服务端设置
 * 客户端只能设置 SameSite 和 Secure 属性
 */
export function setSecureCookie(
  name: string,
  value: string,
  maxAge: number = COOKIE_MAX_AGE
): void {
  setCookie(name, value, maxAge, {
    secure: isProduction(),
    sameSite: isProduction() ? 'strict' : 'lax',
  });
}
