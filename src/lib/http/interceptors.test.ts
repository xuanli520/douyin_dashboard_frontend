import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tokenRefreshInterceptor } from './interceptors';

describe('tokenRefreshInterceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = 'refresh_token=test-refresh-token';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('401 刷新成功后应返回重试请求的响应对象', async () => {
    const fetchMock = vi.spyOn(global, 'fetch');

    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { access_token: 'new-access-token' } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 200, data: { ok: true } }), {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
        })
      );

    const originalError = {
      status: 401,
      config: {
        url: '/api/v1/auth/users/me',
        method: 'GET',
      },
    } as any;

    const result = await tokenRefreshInterceptor.onResponseError!(originalError);

    expect(result).toMatchObject({
      status: 200,
      statusText: 'OK',
    });
    expect((result as any).data).toEqual({ code: 200, data: { ok: true } });
  });
});
