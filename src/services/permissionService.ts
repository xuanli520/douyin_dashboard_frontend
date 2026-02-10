import { apiClient } from '@/lib/api-client-extended';
import { Permission, Role, PermissionCode } from '@/types';
import { RBAC_CONFIG } from '@/config/rbac';

const API_BASE = '/api/v1/permissions';
const API_TIMEOUT = 5000;
const DEFAULT_PAGE_SIZE = RBAC_CONFIG.PERMISSION.DEFAULT_PAGE_SIZE;

let getPermissionsRequestId = 0;
let getRolesRequestId = 0;
let getMyPermsRequestId = 0;

export async function getPermissions(
  page = 1,
  pageSize = 100
): Promise<{ results: Permission[]; total: number; page: number; page_size: number; total_pages: number }> {
  const requestId = ++getPermissionsRequestId;
  try {
    const response = await apiClient.get<{ results: Permission[]; total: number; page: number; page_size: number; total_pages: number }>(
      `${API_BASE}?page=${page}&page_size=${pageSize}`,
      { timeout: 5000 }
    );
    if (requestId !== getPermissionsRequestId) {
      throw new Error('Request cancelled');
    }
    return response;
  } catch (error) {
    if (requestId !== getPermissionsRequestId) {
      console.log('Permission request cancelled');
      throw error;
    }
    throw error;
  }
}

export async function getPermissionById(id: number): Promise<Permission> {
  return apiClient.get<Permission>(`${API_BASE}/${id}`);
}

export async function getRoles(
  page = 1,
  pageSize = 100
): Promise<{ results: Role[]; total: number; page: number; page_size: number; total_pages: number }> {
  const requestId = ++getRolesRequestId;
  try {
    const response = await apiClient.get<{ results: Role[]; total: number; page: number; page_size: number; total_pages: number }>(
      `/api/v1/roles?page=${page}&page_size=${pageSize}`,
      { timeout: 5000 }
    );
    if (requestId !== getRolesRequestId) {
      throw new Error('Request cancelled');
    }
    return response;
  } catch (error) {
    if (requestId !== getRolesRequestId) {
      console.log('Roles request cancelled');
      throw error;
    }
    throw error;
  }
}

export async function getUserRoles(userId: number): Promise<Role[]> {
  return apiClient.get<Role[]>(`/api/v1/users/${userId}/roles`);
}

export async function getMyPermissions(): Promise<{ permissions: PermissionCode[]; is_superuser: boolean; roles: Role[] }> {
  const requestId = ++getMyPermsRequestId;
  try {
    const response = await apiClient.get<{ permissions: PermissionCode[]; is_superuser: boolean; roles: Role[] }>('/api/v1/users/me/permissions');
    if (requestId !== getMyPermsRequestId) {
      throw new Error('Request cancelled');
    }
    return response;
  } catch (error) {
    if (requestId !== getMyPermsRequestId) {
      console.log('My permissions request cancelled');
      throw error;
    }
    throw error;
  }
}

export async function assignRolesToUser(
  userId: number,
  roleIds: number[]
): Promise<void> {
  return apiClient.post<void>(`/api/v1/users/${userId}/roles`, { role_ids: roleIds });
}
