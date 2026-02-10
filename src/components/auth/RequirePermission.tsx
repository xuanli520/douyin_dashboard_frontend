'use client';

import { usePermissionStore } from '@/stores/permissionStore';
import { useAuthStore } from '@/stores/authStore';
import { PermissionCode } from '@/types';

interface RequirePermissionProps {
  permission: PermissionCode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: 'hide' | 'disable' | 'visible-disabled';
}

export function RequirePermission({ 
  permission, 
  children, 
  fallback = null,
  mode = 'hide',
}: RequirePermissionProps) {
  const { isSuperuser, checkPermission } = usePermissionStore();
  const { isAuthenticated } = useAuthStore();
  
  const hasAccess = isAuthenticated && (isSuperuser || checkPermission(permission));

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (!hasAccess && mode === 'hide') {
    return <>{fallback}</>;
  }

  if (!hasAccess && mode === 'disable') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
