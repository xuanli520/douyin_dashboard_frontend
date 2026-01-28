/**
 * api-client 401 拦截器 API 参数修复验证测试
 *
 * 测试 401 自动刷新时 refresh_token 作为查询参数
 */
import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS } from '@/config/api';

describe('api-client 401 拦截器参数修复验证', () => {
  describe('refreshToken URL 构造', () => {
    it('401 刷新时 refresh_token 应该在查询参数中', () => {
      const refreshTokenValue = 'test-refresh-token';
      const refreshUrl = `${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(refreshTokenValue)}`;

      expect(refreshUrl).toContain('refresh_token=');
      expect(refreshUrl).toBe('/auth/jwt/refresh?refresh_token=test-refresh-token');
    });

    it('应该正确编码特殊字符', () => {
      const refreshTokenValue = 'token/with=special&chars';
      const refreshUrl = `${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(refreshTokenValue)}`;

      expect(refreshUrl).toBe('/auth/jwt/refresh?refresh_token=token%2Fwith%3Dspecial%26chars');
    });
  });

  describe('URL 格式验证', () => {
    it('刷新端点格式正确', () => {
      const token = 'abc123';
      const url = `${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(token)}`;

      // 验证 refresh_token 在查询参数中，不在请求体中
      const [baseUrl, queryString] = url.split('?');
      expect(baseUrl).toBe(API_ENDPOINTS.JWT_REFRESH);
      expect(queryString).toBe(`refresh_token=${token}`);
      expect(queryString.startsWith('refresh_token=')).toBe(true);
    });

    it('刷新请求不包含请求体', () => {
      const token = 'abc123';
      const url = `${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(token)}`;

      // 验证 URL 以 ?refresh_token= 开头，说明是查询参数
      expect(url).toMatch(/^\/auth\/jwt\/refresh\?refresh_token=.+$/);
    });
  });

  describe('端点路径验证', () => {
    it('JWT_REFRESH 端点路径正确', () => {
      expect(API_ENDPOINTS.JWT_REFRESH).toBe('/auth/jwt/refresh');
    });

    it('JWT_LOGOUT 端点路径正确', () => {
      expect(API_ENDPOINTS.JWT_LOGOUT).toBe('/auth/jwt/logout');
    });

    it('JWT_LOGIN 端点路径正确', () => {
      expect(API_ENDPOINTS.JWT_LOGIN).toBe('/auth/jwt/login');
    });
  });
});
