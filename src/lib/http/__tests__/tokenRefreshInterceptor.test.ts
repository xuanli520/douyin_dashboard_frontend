import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/config/api';

vi.mock('@/lib/auth', () => ({
  getAccessToken: vi.fn(() => 'expired-access-token'),
  setAccessToken: vi.fn(),
  getRefreshToken: vi.fn(() => 'refresh-token'),
  clearTokens: vi.fn(),
}));

import { setAccessToken } from '@/lib/auth';
import { HttpClient } from '../client';
import { authInterceptor, tokenRefreshInterceptor } from '../interceptors';

describe('tokenRefreshInterceptor', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  it('returns retried response data after refreshing an expired token', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ msg: 'token expired' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: { access_token: 'new-access-token' },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        code: 200,
        data: { id: 1, username: 'tester' },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));

    const client = new HttpClient({ baseURL: '' });
    client.addRequestInterceptor(authInterceptor);
    client.addResponseInterceptor(tokenRefreshInterceptor);

    const result = await client.get(API_ENDPOINTS.USERS_ME);

    expect(result).toEqual({
      code: 200,
      data: { id: 1, username: 'tester' },
    });
    expect(setAccessToken).toHaveBeenCalledWith('new-access-token');
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${API_ENDPOINTS.JWT_REFRESH}?refresh_token=refresh-token`,
      { method: 'POST' }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      API_ENDPOINTS.USERS_ME,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer new-access-token',
        }),
        method: 'GET',
      })
    );
  });
});
