import { PermissionCode, RoutePermissionConfig } from '@/types';
import { ROUTES } from './routes';

export const PAGE_PERMISSIONS: RoutePermissionConfig[] = [
  {
    route: ROUTES.COMPASS,
    requiredPermissions: ['shop:view'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.DASHBOARD,
    requiredPermissions: ['dashboard:view'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.DATA_ANALYSIS,
    requiredPermissions: ['analysis:view'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.TASK_SCHEDULE,
    requiredPermissions: ['schedule:view'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.TASK_SCHEDULE_COLLECTION_JOBS,
    requiredPermissions: ['schedule:view'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.REPORTS,
    requiredPermissions: ['report:view'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.RISK_ALERT,
    requiredPermissions: ['alert:view'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.DATA_SOURCE,
    requiredPermissions: ['data_source:view'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.SCRAPING_RULE,
    requiredPermissions: ['task:view'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.USER_PERMISSION,
    requiredPermissions: [],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.ADMIN_USERS,
    requiredPermissions: ['user:read'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.ADMIN_ROLES,
    requiredPermissions: ['role:read'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.ADMIN_PERMISSIONS,
    requiredPermissions: ['permission:read'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.ADMIN_LOGIN_AUDIT,
    requiredPermissions: ['audit:read'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.PROFILE,
    requiredPermissions: [],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.SYSTEM_SETTINGS,
    requiredPermissions: ['system:user_settings'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: /^\/users\/\d+$/,
    requiredPermissions: ['user:read'],
    requiredRoles: ['admin', 'manager'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
];

export const PUBLIC_ROUTES: (string | RegExp)[] = [
  '/login',
  '/register',
  '/forgot-password',
  '/403',
  '/404',
  '/500',
];

export function matchRoutePermission(pathname: string): RoutePermissionConfig | null {
  if (PUBLIC_ROUTES.some(route => 
    route === pathname || 
    (route instanceof RegExp && (route as RegExp).test(pathname))
  )) {
    return null;
  }

  return PAGE_PERMISSIONS.find(config => {
    if (typeof config.route === 'string') {
      return config.route === pathname;
    }
    if (config.route instanceof RegExp) {
      return (config.route as RegExp).test(pathname);
    }
    return false;
  }) || null;
}

export const COMPONENT_PERMISSIONS: Record<string, PermissionCode> = {
  'create-user': 'user:create',
  'edit-user': 'user:update',
  'delete-user': 'user:delete',
  'view-user': 'user:read',
  'create-role': 'role:create',
  'edit-role': 'role:update',
  'delete-role': 'role:delete',
  'assign-role': 'user:manage_roles',
  'export-data': 'export:create',
  'import-data': 'data_import:upload',
  'view-analytics': 'analysis:view',
  'manage-settings': 'system:user_settings',
};

export const PERMISSION_MODULES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  DATA: 'data',
  REPORT: 'report',
  SETTINGS: 'settings',
  SYSTEM: 'system',
} as const;

export type PermissionModule = typeof PERMISSION_MODULES[keyof typeof PERMISSION_MODULES];
