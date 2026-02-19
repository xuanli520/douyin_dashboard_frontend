import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { endpointStatusInterceptor, tokenRefreshInterceptor } from './interceptors';

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

describe('endpointStatusInterceptor', () => {
  it('deprecated soft 响应可被处理并返回原响应', async () => {
    const headers = new Headers();
    headers.set('content-type', 'application/json');
    headers.set('X-Deprecated', 'true');
    headers.set('X-Deprecated-Alternative', '/api/v1/new-endpoint');
    headers.set('X-Deprecated-Removal-Date', '2026-03-01');

    const response = {
      status: 200,
      statusText: 'OK',
      headers,
      data: { msg: 'deprecated endpoint' },
    };

    const result = await endpointStatusInterceptor.onResponse!(response as any);
    expect(result).toBe(response);
  });
});
