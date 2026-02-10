'use client';

import { usePermissionStore } from '@/stores/permissionStore';
import { useAuthStore } from '@/stores/authStore';
import { PermissionCode } from '@/types';
import { ReactNode } from 'react';

interface PermissionGateProps {
  permission: PermissionCode;
  children: ReactNode;
  fallback?: ReactNode;
  mode?: 'hide' | 'disable' | 'visible-disabled';
}

interface PermissionGatesProps {
  permissions: PermissionCode[];
  children: ReactNode;
  fallback?: ReactNode;
  operator?: 'and' | 'or';
  mode?: 'hide' | 'disable' | 'visible-disabled';
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
  mode = 'hide',
}: PermissionGateProps) {
  const { isSuperuser, checkPermission } = usePermissionStore();
  const { isAuthenticated } = useAuthStore();
  
  const hasAccess = isAuthenticated && (isSuperuser || checkPermission(permission));

  if (!isAuthenticated || !hasAccess) {
    if (mode === 'visible-disabled') {
      return <>{typeof children === 'string' ? <span className="opacity-50">{children}</span> : <span className="opacity-50">{children}</span>}</>;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function PermissionGates({
  permissions,
  children,
  fallback = null,
  operator = 'and',
  mode = 'hide',
}: PermissionGatesProps) {
  const { isSuperuser, checkAllPermissions, checkAnyPermission } = usePermissionStore();
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (isSuperuser) {
    return <>{children}</>;
  }

  const hasAccess = operator === 'and'
    ? checkAllPermissions(permissions)
    : checkAnyPermission(permissions);

  if (!hasAccess) {
    if (mode === 'visible-disabled') {
      return <>{typeof children === 'string' ? <span className="opacity-50">{children}</span> : <span className="opacity-50">{children}</span>}</>;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
