'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissionStore } from '@/stores/permissionStore';
import { useAuthStore } from '@/stores/authStore';
import { PermissionCode, RoutePermissionConfig } from '@/types';

interface RouteGuardProps {
  children: React.ReactNode;
  config: RoutePermissionConfig;
  fallback?: React.ReactNode;
}

export function RouteGuard({ children, config }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();
  
  const [checked, setChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkPermission = useCallback((cfg: RoutePermissionConfig) => {
    const { isAuthenticated } = authStore;
    const {
      checkAllPermissions,
      checkRole,
      isSuperuser,
    } = permissionStore;

    const {
      requiredPermissions = [],
      requiredRoles = [],
      unauthRedirect = '/login',
      forbiddenRedirect = '/403',
    } = cfg;

    if (!isAuthenticated) {
      router.replace(unauthRedirect);
      return false;
    }

    if (requiredRoles.length > 0) {
      const hasRequiredRoles = requiredRoles.some(role => checkRole(role));
      if (!hasRequiredRoles) {
        router.replace(forbiddenRedirect);
        return false;
      }
    }

    if (requiredPermissions.length > 0) {
      const hasRequiredPerms = isSuperuser || checkAllPermissions(requiredPermissions);
      if (!hasRequiredPerms) {
        router.replace(forbiddenRedirect);
        return false;
      }
    }

    return true;
  }, [authStore, permissionStore, router]);

  useEffect(() => {
    if (authStore.isLoading) {
      return;
    }

    const authorized = checkPermission(config);
    setIsAuthorized(authorized);
    setChecked(true);
  }, [config, authStore.isLoading, checkPermission]);

  if (authStore.isLoading && !checked) {
    return config.fallback || <div>Loading...</div>;
  }

  if (!checked) {
    return config.fallback !== undefined ? config.fallback : null;
  }

  if (!isAuthorized) {
    return config.fallback !== undefined ? config.fallback : null;
  }

  return <>{children}</>;
}
