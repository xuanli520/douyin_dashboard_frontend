// 用户 API 服务层
import { authGet, authPost, authPatch, authDel } from '@/lib/api-client';
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  clearTokens,
  storeTokens,
} from '@/lib/auth';
import {
  type User,
  type UserCreate,
  type UserUpdate,
  type UserUpdateMe,
  type TokenResponse,
  type LoginParams,
  type RegisterParams,
  type PasswordStrength,
  AUTH_ERROR_CODES,
} from '@/types/user';

const AUTH_API = '/auth';

// 后端响应包装格式
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// 辅助函数：处理后端包装的响应
async function wrappedGet<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await authGet<ApiResponse<T>>(url, options);
  if (response.code !== 200) {
    throw new Error(response.msg || '请求失败');
  }
  return response.data;
}

async function wrappedPost<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
  const response = await authPost<ApiResponse<T>>(url, data, options);
  if (response.code !== 200) {
    throw new Error(response.msg || '请求失败');
  }
  return response.data;
}

async function wrappedPatch<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
  const response = await authPatch<ApiResponse<T>>(url, data, options);
  if (response.code !== 200) {
    throw new Error(response.msg || '请求失败');
  }
  return response.data;
}

async function wrappedDel<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await authDel<ApiResponse<T>>(url, options);
  if (response.code !== 200) {
    throw new Error(response.msg || '请求失败');
  }
  return response.data;
}

// ============ 认证相关 ============

/**
 * 登录 - 直接使用 authPost，因为 /jwt/login 返回未包装的格式
 */
export async function login(params: LoginParams): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('username', params.username);
  formData.append('password', params.password);
  if (params.captchaVerifyParam) {
    formData.append('captcha_verify_param', params.captchaVerifyParam);
  }

  // /jwt/login 返回未包装的格式，直接使用 authPost
  const response = await authPost<TokenResponse>(
    `${AUTH_API}/jwt/login`,
    formData,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  // 存储 token
  storeTokens(response);

  return response;
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  const refreshTokenValue = getRefreshToken();
  if (refreshTokenValue) {
    try {
      // 后端期望 refresh_token 在查询参数中
      await authPost<ApiResponse<null>>(`${AUTH_API}/jwt/logout?refresh_token=${encodeURIComponent(refreshTokenValue)}`);
    } catch {
      // 即使请求失败也要清除本地令牌
    }
  }
  // 清除本地令牌
  clearTokens();

  // 强制刷新页面以确保完全清除所有状态（包括 HttpOnly cookie）
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * 刷新访问令牌 - /jwt/refresh 返回未包装的格式
 */
export async function refreshToken(): Promise<{ access_token: string; token_type: string }> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  // refresh 接口返回未包装的格式，使用 authPost 直接获取
  const response = await authPost<{ access_token: string; token_type: string }>(
    `${AUTH_API}/jwt/refresh`,
    { refresh_token: refreshTokenValue }
  );

  // 更新本地存储的 token
  setAccessToken(response.access_token);
  // 设置 auth_token cookie 供 middleware 验证
  if (typeof document !== 'undefined') {
    document.cookie = `auth_token=${response.access_token}; path=/; max-age=${60 * 60 * 24}`;
  }

  return response;
}

/**
 * 注册
 */
export async function register(params: RegisterParams): Promise<User> {
  return wrappedPost<User>(`${AUTH_API}/register`, params);
}

// ============ 用户管理 ============

/**
 * 获取当前登录用户信息
 */
export async function getCurrentUser(): Promise<User> {
  return wrappedGet<User>(`${AUTH_API}/users/me`);
}

/**
 * 更新当前用户信息 (PATCH /auth/users/me)
 */
export async function updateCurrentUser(data: UserUpdateMe): Promise<User> {
  return wrappedPatch<User>(`${AUTH_API}/users/me`, data);
}

/**
 * 根据 ID 获取用户信息 (需要 superuser 权限)
 */
export async function getUserById(id: number): Promise<User> {
  return wrappedGet<User>(`${AUTH_API}/users/${id}`);
}

/**
 * 更新指定用户信息 (需要 superuser 权限, PATCH /auth/users/{user_id})
 */
export async function updateUser(id: number, data: UserUpdate): Promise<User> {
  return wrappedPatch<User>(`${AUTH_API}/users/${id}`, data);
}

/**
 * 删除指定用户 (需要 superuser 权限)
 */
export async function deleteUser(id: number): Promise<void> {
  await wrappedDel(`${AUTH_API}/users/${id}`);
}

/**
 * 检查当前用户是否为超级管理员
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

const ERROR_MSG_MAP: Record<string, string> = {
  REGISTER_USER_ALREADY_EXISTS: '用户已存在',
  REGISTER_INVALID_EMAIL: '邮箱格式错误',
};

/**
 * 处理认证错误
 */
export function handleAuthError(error: unknown): string {
  if (error instanceof Error) {
    const err = error as Error & { code?: number; data?: { validation_errors?: Array<{ message?: string }> } };
    const code = err.code;
    if (code && AUTH_ERROR_CODES[code as keyof typeof AUTH_ERROR_CODES]) {
      return AUTH_ERROR_CODES[code as keyof typeof AUTH_ERROR_CODES];
    }
    const rawMessage = error.message;
    if (ERROR_MSG_MAP[rawMessage]) {
      return ERROR_MSG_MAP[rawMessage];
    }
    const data = err.data;
    if (data?.validation_errors?.length) {
      const first = data.validation_errors[0];
      if (first?.message) return first.message;
    }
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
 */
export function checkPasswordStrength(password: string): PasswordStrength {
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
