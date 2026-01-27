// 用户 API 服务层
import { get, post, patch, del } from '@/lib/api';
import { getAccessToken, getRefreshToken } from '@/lib/auth';
import type { User, UserCreate, UserUpdate, UserUpdateMe, TokenResponse, LoginParams } from '@/types/user';

const AUTH_API = '/auth';

// 辅助函数：获取带认证的请求头
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 后端响应包装格式
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// 辅助函数：处理后端包装的响应
async function wrappedGet<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await get<ApiResponse<T>>(url, options);
  if (response.code !== 200) {
    throw new Error(response.msg || '请求失败');
  }
  return response.data;
}

async function wrappedPost<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
  const response = await post<ApiResponse<T>>(url, data, options);
  if (response.code !== 200) {
    throw new Error(response.msg || '请求失败');
  }
  return response.data;
}

async function wrappedPatch<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
  const response = await patch<ApiResponse<T>>(url, data, options);
  if (response.code !== 200) {
    throw new Error(response.msg || '请求失败');
  }
  return response.data;
}

async function wrappedDel<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await del<ApiResponse<T>>(url, options);
  if (response.code !== 200) {
    throw new Error(response.msg || '请求失败');
  }
  return response.data;
}

// ============ 认证相关 ============

export async function login(params: LoginParams): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('username', params.username);
  formData.append('password', params.password);

  const response = await wrappedPost<TokenResponse>(
    `${AUTH_API}/jwt/login`,
    formData,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  // 存储 access_token
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', response.access_token);
  }

  return response;
}

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
  // 清除本地令牌
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    document.cookie = 'refresh_token=; path=/; max-age=0';
    document.cookie = 'auth_token=; path=/; max-age=0';
  }
}

export async function refreshAccessToken(): Promise<{ access_token: string; token_type: string }> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await wrappedPost<{ access_token: string; token_type: string }>(
    `${AUTH_API}/jwt/refresh`,
    { refresh_token: refreshToken }
  );

  // 更新本地存储的 token
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', response.access_token);
  }

  return response;
}

// ============ 用户管理 ============

/**
 * 获取当前登录用户信息
 */
export async function getCurrentUser(): Promise<User> {
  return wrappedGet<User>(`${AUTH_API}/users/me`, {
    headers: getAuthHeaders(),
  });
}

/**
 * 更新当前用户信息 (PATCH /auth/users/me)
 */
export async function updateCurrentUser(data: UserUpdateMe): Promise<User> {
  return wrappedPatch<User>(`${AUTH_API}/users/me`, data, {
    headers: getAuthHeaders(),
  });
}

/**
 * 根据 ID 获取用户信息 (需要 superuser 权限)
 */
export async function getUserById(id: number): Promise<User> {
  return wrappedGet<User>(`${AUTH_API}/users/${id}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * 更新指定用户信息 (需要 superuser 权限, PATCH /auth/users/{user_id})
 */
export async function updateUser(id: number, data: UserUpdate): Promise<User> {
  return wrappedPatch<User>(`${AUTH_API}/users/${id}`, data, {
    headers: getAuthHeaders(),
  });
}

/**
 * 删除指定用户 (需要 superuser 权限)
 */
export async function deleteUser(id: number): Promise<void> {
  await wrappedDel(`${AUTH_API}/users/${id}`, {
    headers: getAuthHeaders(),
  });
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
