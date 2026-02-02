import { authGet, authPost, authPatch, authDel } from '@/lib/api-client';
import { API_ENDPOINTS, SUCCESS_CODE } from '@/config/api';
import { User, UserCreate, UserUpdate } from '@/types/user';

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface UserListParams {
  page?: number;
  size?: number;
  username?: string;
  email?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  role_id?: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  superusers: number;
}

async function wrappedRequest<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const response = await promise;
  if (response.code !== SUCCESS_CODE) {
    throw new Error(response.msg || `Request failed with code ${response.code}`);
  }
  return response.data;
}

export async function getUsers(params: UserListParams): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  return wrappedRequest(authGet(`${API_ENDPOINTS.ADMIN_USERS}?${searchParams.toString()}`));
}

export async function getUserStats(baseParams: UserListParams, totalFromList?: number): Promise<UserStats> {
  // If we already have total from the list request, we can use it.
  // Otherwise we fetch it.
  
  const fetchCount = async (overrideParams: Partial<UserListParams>) => {
    const params = { ...baseParams, ...overrideParams, size: 1, page: 1 };
    const res = await getUsers(params);
    return res.total;
  };

  const [active, inactive, superusers] = await Promise.all([
    fetchCount({ is_active: true }),
    fetchCount({ is_active: false }),
    fetchCount({ is_superuser: true }),
  ]);

  const total = totalFromList !== undefined ? totalFromList : await fetchCount({});

  return {
    total,
    active,
    inactive,
    superusers
  };
}

export async function createUser(data: UserCreate & { role_ids?: number[] }): Promise<User> {
  return wrappedRequest(authPost(API_ENDPOINTS.ADMIN_USERS, data));
}

export async function updateUser(id: number, data: UserUpdate): Promise<User> {
  return wrappedRequest(authPatch(API_ENDPOINTS.ADMIN_USER_DETAIL(id), data));
}

export async function deleteUser(id: number): Promise<void> {
  return wrappedRequest(authDel(API_ENDPOINTS.ADMIN_USER_DETAIL(id)));
}

export async function assignRoles(userId: number, roleIds: number[]): Promise<void> {
  return wrappedRequest(authPost(API_ENDPOINTS.ADMIN_USER_ROLES(userId), { role_ids: roleIds }));
}

// Roles for dropdown
export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  module: string;
  created_at: string;
  updated_at: string;
}

// 角色列表返回的基础角色类型（不包含权限）
export interface Role {
  id: number;
  name: string;
  description?: string | null;
  is_system: boolean;
  permissions?: Permission[]; // 列表接口可能不返回
  created_at: string;
  updated_at: string;
}

// 获取单个角色时返回的完整类型（包含权限）
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface RoleCreate {
  name: string;
  description?: string;
}

export interface RoleUpdate {
  name?: string;
  description?: string;
}

export async function getRolesList(): Promise<Role[]> {
  // Mock data commented out as we are enabling real API calls.
  // Note: The original mock data had an issue with object references in the permissions array.
  // If reverting to mock, use Array.from to generate independent objects.
  /*
  const mockRoles: Role[] = [
    {
      id: 1,
      name: 'Administrator',
      description: '拥有系统所有权限，包括用户管理、系统设置等核心功能。',
      is_system: true,
      permissions: Array.from({ length: 45 }, (_, i) => ({ id: i } as Permission)),
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Data Analyst',
      description: '负责查看、分析和导出各类业务数据报表，无系统配置权限。',
      is_system: false,
      permissions: Array.from({ length: 12 }, (_, i) => ({ id: i } as Permission)),
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Content Operator',
      description: '负责视频内容的审核、发布管理及日常运营活动配置。',
      is_system: false,
      permissions: Array.from({ length: 8 }, (_, i) => ({ id: i } as Permission)),
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Viewer',
      description: '仅拥有查看基础公开数据的只读权限。',
      is_system: false,
      permissions: Array.from({ length: 3 }, (_, i) => ({ id: i } as Permission)),
      created_at: new Date().toISOString()
    }
  ];

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockRoles), 500);
  });
  */
  
  const res = await authGet<ApiResponse<Role[]>>(API_ENDPOINTS.ADMIN_ROLES);
  return wrappedRequest(Promise.resolve(res));
}

export async function getRole(id: number): Promise<RoleWithPermissions> {
  return wrappedRequest(authGet(API_ENDPOINTS.ADMIN_ROLE_DETAIL(id)));
}

export async function createRole(data: RoleCreate): Promise<Role> {
  return wrappedRequest(authPost(API_ENDPOINTS.ADMIN_ROLES, data));
}

export async function updateRole(id: number, data: RoleUpdate): Promise<Role> {
  return wrappedRequest(authPatch(API_ENDPOINTS.ADMIN_ROLE_DETAIL(id), data));
}

export async function deleteRole(id: number): Promise<void> {
  return wrappedRequest(authDel(API_ENDPOINTS.ADMIN_ROLE_DETAIL(id)));
}

export async function assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
  return wrappedRequest(authPost(API_ENDPOINTS.ADMIN_ROLE_PERMISSIONS(roleId), { permission_ids: permissionIds }));
}

export async function getPermissions(): Promise<Permission[]> {
  /*
  const mockPermissions: Permission[] = [
    // User Module
    { id: 1, code: 'user:read', name: '查看用户', description: '允许查看用户列表和详情', module: '用户管理' },
    { id: 2, code: 'user:create', name: '创建用户', description: '允许创建新用户', module: '用户管理' },
    { id: 3, code: 'user:update', name: '更新用户', description: '允许编辑用户信息', module: '用户管理' },
    { id: 4, code: 'user:delete', name: '删除用户', description: '允许删除用户', module: '用户管理' },
    
    // Role Module
    { id: 5, code: 'role:read', name: '查看角色', description: '允许查看角色列表', module: '角色管理' },
    { id: 6, code: 'role:create', name: '创建角色', description: '允许创建新角色', module: '角色管理' },
    { id: 7, code: 'role:update', name: '更新角色', description: '允许编辑角色信息', module: '角色管理' },
    { id: 8, code: 'role:delete', name: '删除角色', description: '允许删除角色', module: '角色管理' },
    { id: 9, code: 'role:assign', name: '分配权限', description: '允许给角色分配权限', module: '角色管理' },

    // Content Module
    { id: 10, code: 'content:read', name: '查看内容', description: '允许浏览所有内容', module: '内容管理' },
    { id: 11, code: 'content:audit', name: '审核内容', description: '允许审核发布的内容', module: '内容管理' },
    { id: 12, code: 'content:publish', name: '发布内容', description: '允许发布新内容', module: '内容管理' },
    { id: 13, code: 'content:delete', name: '删除内容', description: '允许删除违规内容', module: '内容管理' },

    // Data Analysis Module
    { id: 14, code: 'data:view_daily', name: '查看日报', description: '允许查看每日数据汇总', module: '数据分析' },
    { id: 15, code: 'data:view_trends', name: '查看趋势', description: '允许查看长期数据趋势', module: '数据分析' },
    { id: 16, code: 'data:export', name: '导出报表', description: '允许导出数据报表', module: '数据分析' },

    // System Settings
    { id: 17, code: 'system:config', name: '系统配置', description: '允许修改系统全局配置', module: '系统设置' },
    { id: 18, code: 'system:logs', name: '查看日志', description: '允许查看系统操作日志', module: '系统设置' },
  ];

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPermissions), 500);
  });
  */

  const res = await authGet<ApiResponse<Permission[]>>(API_ENDPOINTS.ADMIN_PERMISSIONS);
  return wrappedRequest(Promise.resolve(res));
}
