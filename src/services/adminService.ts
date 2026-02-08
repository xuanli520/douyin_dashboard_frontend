import { authGet, authPost, authPatch, authDel, ApiResponse, PaginatedData } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import {
  UserListItem,
  UserCreateByAdmin,
  UserUpdateByAdmin,
  UserStatsResponse,
  RoleRead,
  RoleWithPermissions,
  RoleCreate,
  RoleUpdate,
  PermissionRead,
  AssignRolesRequest,
  PaginatedUserListItem,
  PaginatedRoleRead,
  PaginatedPermissionRead,
} from '@/types';

export interface UserListParams {
  username?: string;
  email?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  role_id?: number;
  page?: number;
  size?: number;
}

export interface RoleListParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface PermissionListParams {
  module?: string;
  name?: string;
  page?: number;
  size?: number;
}

async function wrappedRequest<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const response = await promise;
  if (![200, 201, 202, 203, 204, 205, 206, 207, 208, 209].includes(response.code)) {
    throw new Error(response.msg || `Request failed with code ${response.code}`);
  }
  return response.data;
}

export async function getUsers(params: UserListParams): Promise<PaginatedUserListItem> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  return wrappedRequest(
    authGet<ApiResponse<PaginatedUserListItem>>(`${API_ENDPOINTS.ADMIN_USERS}?${searchParams.toString()}`)
  );
}

export async function getUserStats(): Promise<UserStatsResponse> {
  const response = await authGet<ApiResponse<UserStatsResponse>>(API_ENDPOINTS.ADMIN_USERS_STATS);
  return wrappedRequest(Promise.resolve(response));
}

export async function createUser(data: UserCreateByAdmin): Promise<UserListItem> {
  return wrappedRequest(
    authPost<ApiResponse<UserListItem>>(API_ENDPOINTS.ADMIN_USERS, data)
  );
}

export async function updateUser(user_id: number, data: UserUpdateByAdmin): Promise<UserListItem> {
  return wrappedRequest(
    authPatch<ApiResponse<UserListItem>>(API_ENDPOINTS.ADMIN_USER_DETAIL(user_id), data)
  );
}

export async function deleteUser(user_id: number): Promise<void> {
  await wrappedRequest(
    authDel<ApiResponse<void>>(API_ENDPOINTS.ADMIN_USER_DETAIL(user_id))
  );
}

export async function assignUserRoles(user_id: number, roleIds: number[]): Promise<void> {
  await wrappedRequest(
    authPost<ApiResponse<void>>(
      API_ENDPOINTS.ADMIN_USER_ROLES(user_id),
      { role_ids: roleIds }
    )
  );
}

export async function getRolesList(params?: RoleListParams): Promise<PaginatedRoleRead> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
  }

  const url = searchParams.toString()
    ? `${API_ENDPOINTS.ADMIN_ROLES}?${searchParams.toString()}`
    : API_ENDPOINTS.ADMIN_ROLES;

  return wrappedRequest(
    authGet<ApiResponse<PaginatedRoleRead>>(url)
  );
}

export async function getRole(role_id: number): Promise<RoleWithPermissions> {
  return wrappedRequest(
    authGet<ApiResponse<RoleWithPermissions>>(API_ENDPOINTS.ADMIN_ROLE_DETAIL(role_id))
  );
}

export async function createRole(data: RoleCreate): Promise<RoleRead> {
  return wrappedRequest(
    authPost<ApiResponse<RoleRead>>(API_ENDPOINTS.ADMIN_ROLES, data)
  );
}

export async function updateRole(role_id: number, data: RoleUpdate): Promise<RoleRead> {
  return wrappedRequest(
    authPatch<ApiResponse<RoleRead>>(API_ENDPOINTS.ADMIN_ROLE_DETAIL(role_id), data)
  );
}

export async function deleteRole(role_id: number): Promise<void> {
  await wrappedRequest(
    authDel<ApiResponse<void>>(API_ENDPOINTS.ADMIN_ROLE_DETAIL(role_id))
  );
}

export async function assignRolePermissions(role_id: number, permissionIds: number[]): Promise<void> {
  await wrappedRequest(
    authPost<ApiResponse<void>>(
      API_ENDPOINTS.ADMIN_ROLE_PERMISSIONS(role_id),
      { permission_ids: permissionIds }
    )
  );
}

export async function getPermissions(params?: PermissionListParams): Promise<PaginatedPermissionRead> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
  }

  const url = searchParams.toString()
    ? `${API_ENDPOINTS.ADMIN_PERMISSIONS}?${searchParams.toString()}`
    : API_ENDPOINTS.ADMIN_PERMISSIONS;

  return wrappedRequest(
    authGet<ApiResponse<PaginatedPermissionRead>>(url)
  );
}
