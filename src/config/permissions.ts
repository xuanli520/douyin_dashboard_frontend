import { PermissionCode, RoutePermissionConfig } from '@/types';
import { ROUTES } from './routes';

export const PAGE_PERMISSIONS: RoutePermissionConfig[] = [
  {
    route: ROUTES.COMPASS,
    requiredPermissions: ['view:compass'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.DASHBOARD,
    requiredPermissions: ['view:dashboard'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.DATA_ANALYSIS,
    requiredPermissions: ['view:data_analysis'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.TASK_SCHEDULE,
    requiredPermissions: ['view:task_schedule'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.REPORTS,
    requiredPermissions: ['view:reports'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.RISK_ALERT,
    requiredPermissions: ['view:risk_alert'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.DATA_SOURCE,
    requiredPermissions: ['view:data_source'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.SCRAPING_RULE,
    requiredPermissions: ['view:scraping_rule'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: ROUTES.USER_PERMISSION,
    requiredPermissions: ['view:user_permission'],
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
    requiredPermissions: ['system:logs'],
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
    requiredPermissions: ['system:settings'],
    unauthRedirect: '/login',
    forbiddenRedirect: '/403',
  },
  {
    route: /^\/users\/\d+$/,
    requiredPermissions: ['view:user_detail'],
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
  'create-user': 'create:user',
  'edit-user': 'edit:user',
  'delete-user': 'delete:user',
  'view-user': 'view:user',
  'create-role': 'create:role',
  'edit-role': 'edit:role',
  'delete-role': 'delete:role',
  'assign-role': 'assign:role',
  'export-data': 'export:data',
  'import-data': 'import:data',
  'view-analytics': 'view:analytics',
  'manage-settings': 'manage:settings',
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
