export interface ErrorCodeInfo {
  code: string;
  message: string;
  description?: string;
}

export const AUTH_ERROR_CODES: Record<string, ErrorCodeInfo> = {
  REGISTER_USER_ALREADY_EXISTS: {
    code: 'REGISTER_USER_ALREADY_EXISTS',
    message: '用户已存在',
    description: 'A user with this email already exists.',
  },
  REGISTER_INVALID_PASSWORD: {
    code: 'REGISTER_INVALID_PASSWORD',
    message: '密码强度不足',
    description: 'Password should be at least 3 characters',
  },
  RESET_PASSWORD_BAD_TOKEN: {
    code: 'RESET_PASSWORD_BAD_TOKEN',
    message: '重置链接已过期',
    description: 'Bad or expired token.',
  },
  RESET_PASSWORD_INVALID_PASSWORD: {
    code: 'RESET_PASSWORD_INVALID_PASSWORD',
    message: '密码强度不足',
    description: 'Password should be at least 3 characters',
  },
  VERIFY_USER_BAD_TOKEN: {
    code: 'VERIFY_USER_BAD_TOKEN',
    message: '验证链接无效',
    description: 'Bad token, not existing user or not the e-mail currently set for the user.',
  },
  VERIFY_USER_ALREADY_VERIFIED: {
    code: 'VERIFY_USER_ALREADY_VERIFIED',
    message: '用户已验证',
    description: 'The user is already verified.',
  },
  UPDATE_USER_EMAIL_ALREADY_EXISTS: {
    code: 'UPDATE_USER_EMAIL_ALREADY_EXISTS',
    message: '邮箱已被使用',
    description: 'A user with this email already exists.',
  },
  UPDATE_USER_INVALID_PASSWORD: {
    code: 'UPDATE_USER_INVALID_PASSWORD',
    message: '密码强度不足',
    description: 'Password validation failed.',
  },
};

export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '未登录或会话已过期',
  403: '权限不足',
  404: '资源不存在',
  422: '数据验证失败',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '请求超时',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const err = error as Error & { code?: number; data?: unknown };

    if (err.code && HTTP_STATUS_MESSAGES[err.code]) {
      return HTTP_STATUS_MESSAGES[err.code];
    }

    const errorInfo = AUTH_ERROR_CODES[err.message];
    if (errorInfo) {
      return errorInfo.message;
    }

    if (err.data && typeof err.data === 'object' && 'detail' in err.data) {
      const detail = (err.data as Record<string, unknown>).detail;
      if (typeof detail === 'string') {
        const info = AUTH_ERROR_CODES[detail];
        if (info) {
          return info.message;
        }
      }
    }

    return error.message;
  }
  return '未知错误';
}

export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof Error) {
    const err = error as Error & { code?: string };
    if (AUTH_ERROR_CODES[err.message]) {
      return AUTH_ERROR_CODES[err.message].code;
    }
  }
  return undefined;
}

export function getErrorDescription(error: unknown): string | undefined {
  if (error instanceof Error) {
    const err = error as Error & { code?: string };
    if (AUTH_ERROR_CODES[err.message]) {
      return AUTH_ERROR_CODES[err.message].description;
    }
  }
  return undefined;
}
