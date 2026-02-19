import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildRefreshTokenUrl, normalizeTokenResponse } from './auth';

describe('auth token helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = '';
  });

  it('buildRefreshTokenUrl 在无 refresh token 时返回原始 URL', () => {
    const result = buildRefreshTokenUrl('/api/v1/auth/jwt/refresh');
    expect(result).toBe('/api/v1/auth/jwt/refresh');
  });

  it('buildRefreshTokenUrl 优先使用本地可读 refresh token', () => {
    const getItem = window.localStorage.getItem as unknown as ReturnType<typeof vi.fn>;
    getItem.mockReturnValue('local-token');
    document.cookie = 'refresh_token=cookie-token';

    const result = buildRefreshTokenUrl('/api/v1/auth/jwt/refresh');
    expect(result).toBe('/api/v1/auth/jwt/refresh?refresh_token=local-token');
  });

  it('normalizeTokenResponse 支持 data 包裹格式', () => {
    const token = normalizeTokenResponse({
      data: {
        access_token: 'a1',
        token_type: 'Bearer',
      },
    });

    expect(token).toEqual({
      access_token: 'a1',
      token_type: 'Bearer',
    });
  });

  it('normalizeTokenResponse 支持扁平格式', () => {
    const token = normalizeTokenResponse({
      access_token: 'a2',
      token_type: 'Bearer',
    });

    expect(token).toEqual({
      access_token: 'a2',
      token_type: 'Bearer',
    });
  });
});
