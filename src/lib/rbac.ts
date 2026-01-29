export type PermissionCode = string;

export interface UserWithPermissions {
  is_superuser: boolean;
  permissions?: PermissionCode[];
}

/**
 * Check if a user has a specific permission.
 * Superusers always have all permissions.
 */
export function can(user: UserWithPermissions | null | undefined, perm: PermissionCode): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return user.permissions?.includes(perm) ?? false;
}

/**
 * Check if a user has at least one of the specified permissions.
 */
export function canAny(user: UserWithPermissions | null | undefined, perms: PermissionCode[]): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return perms.some(p => user.permissions?.includes(p));
}

/**
 * Check if a user has all of the specified permissions.
 */
export function canAll(user: UserWithPermissions | null | undefined, perms: PermissionCode[]): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return perms.every(p => user.permissions?.includes(p));
}
