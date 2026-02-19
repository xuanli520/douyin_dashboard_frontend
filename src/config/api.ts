export const API_BASE_PATH = '/api/v1';

export const API_ENDPOINTS = {
  JWT_LOGIN: `${API_BASE_PATH}/auth/jwt/login`,
  JWT_REFRESH: `${API_BASE_PATH}/auth/jwt/refresh`,
  JWT_LOGOUT: `${API_BASE_PATH}/auth/jwt/logout`,
  REGISTER: `${API_BASE_PATH}/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_PATH}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_PATH}/auth/reset-password`,
  REQUEST_VERIFY_TOKEN: `${API_BASE_PATH}/auth/request-verify-token`,
  VERIFY: `${API_BASE_PATH}/auth/verify`,

  USERS_ME: `${API_BASE_PATH}/auth/users/me`,
  USERS_BY_ID: (id: number) => `${API_BASE_PATH}/auth/users/${id}`,

  ADMIN_USERS: `${API_BASE_PATH}/admin/users`,
  ADMIN_USERS_STATS: `${API_BASE_PATH}/admin/users/stats`,
  ADMIN_USER_DETAIL: (user_id: number) => `${API_BASE_PATH}/admin/users/${user_id}`,
  ADMIN_USER_ROLES: (user_id: number) => `${API_BASE_PATH}/admin/users/${user_id}/roles`,

  ADMIN_ROLES: `${API_BASE_PATH}/admin/roles`,
  ADMIN_ROLE_DETAIL: (role_id: number) => `${API_BASE_PATH}/admin/roles/${role_id}`,
  ADMIN_ROLE_PERMISSIONS: (role_id: number) => `${API_BASE_PATH}/admin/roles/${role_id}/permissions`,

  ADMIN_PERMISSIONS: `${API_BASE_PATH}/admin/permissions`,

  PERMISSIONS_ME: `${API_BASE_PATH}/permissions/me`,

  ANALYSIS_OVERVIEW: `${API_BASE_PATH}/analysis`,
  ALERTS_LIST: `${API_BASE_PATH}/alerts`,
  REPORTS_OVERVIEW: `${API_BASE_PATH}/reports`,
  SCHEDULES_LIST: `${API_BASE_PATH}/schedules`,
  SHOPS_LIST: `${API_BASE_PATH}/shops`,
  SHOP_SCORE: (shop_id: number) => `${API_BASE_PATH}/shops/${shop_id}/score`,
  METRIC_DETAIL: (metric_type: string) => `${API_BASE_PATH}/metrics/${metric_type}`,
  TASKS_LIST: `${API_BASE_PATH}/tasks`,
  TASK_RUN: (task_id: number) => `${API_BASE_PATH}/tasks/${task_id}/run`,
  TASK_EXECUTIONS: (task_id: number) => `${API_BASE_PATH}/tasks/${task_id}/executions`,
  TASK_STOP: (task_id: number) => `${API_BASE_PATH}/tasks/${task_id}/stop`,

  DATA_SOURCES: `${API_BASE_PATH}/data-sources`,
  DATA_SOURCE_DETAIL: (ds_id: number) => `${API_BASE_PATH}/data-sources/${ds_id}`,
  DATA_SOURCE_ACTIVATE: (ds_id: number) => `${API_BASE_PATH}/data-sources/${ds_id}/activate`,
  DATA_SOURCE_DEACTIVATE: (ds_id: number) => `${API_BASE_PATH}/data-sources/${ds_id}/deactivate`,
  DATA_SOURCE_VALIDATE: (ds_id: number) => `${API_BASE_PATH}/data-sources/${ds_id}/validate`,
  DATA_SOURCE_SCRAPING_RULES: (ds_id: number) => `${API_BASE_PATH}/data-sources/${ds_id}/scraping-rules`,

  SCRAPING_RULES: `${API_BASE_PATH}/scraping-rules`,
  SCRAPING_RULE_DETAIL: (rule_id: number) => `${API_BASE_PATH}/scraping-rules/${rule_id}`,

  AUDIT_LOGS: `${API_BASE_PATH}/audit/logs`,
} as const;

export const SUCCESS_CODES = [200, 201, 202, 203, 204, 205, 206, 207, 208, 209] as const;
export const DEFAULT_TIMEOUT = 30000;
