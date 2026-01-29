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
export interface Role {
  id: number;
  name: string;
  description?: string;
}

export async function getRolesList(): Promise<Role[]> {
  // Assuming /admin/roles returns a list or paginated list.
  // If paginated, we might need to fetch all or use search.
  // For dropdown, we usually want all or top N.
  // API plan says GET /admin/roles.
  // Let's assume it returns PaginatedResponse or List.
  // We'll treat it as generic for now.
  const res = await authGet<ApiResponse<PaginatedResponse<Role> | Role[]>>(API_ENDPOINTS.ADMIN_ROLES);
  if (res.code !== SUCCESS_CODE) throw new Error(res.msg);
  
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return res.data.items; // If paginated
}
