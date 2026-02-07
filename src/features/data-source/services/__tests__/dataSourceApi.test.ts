import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataSourceApi } from '../dataSourceApi';

// Mock the api-client
vi.mock('@/lib/api-client', () => ({
  authGet: vi.fn(),
  authPost: vi.fn(),
  authPut: vi.fn(),
  authDel: vi.fn(),
  ApiResponse: {},
}));

// Mock the config
vi.mock('@/config/api', () => ({
  API_ENDPOINTS: {
    DATA_SOURCES: '/api/data-sources',
    DATA_SOURCE_DETAIL: (id: number) => `/api/data-sources/${id}`,
    DATA_SOURCE_ACTIVATE: (id: number) => `/api/data-sources/${id}/activate`,
    DATA_SOURCE_DEACTIVATE: (id: number) => `/api/data-sources/${id}/deactivate`,
    DATA_SOURCE_RULES: (id: number) => `/api/data-sources/${id}/rules`,
    DATA_SOURCE_VALIDATE: (id: number) => `/api/data-sources/${id}/validate`,
  },
}));

import { authGet, authPost, authPut, authDel } from '@/lib/api-client';

describe('dataSourceApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch data sources list', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'ACTIVE' },
            { id: 2, name: 'Another Source', type: 'FILE_UPLOAD', status: 'INACTIVE' },
          ],
          total: 2,
        },
      };
      vi.mocked(authGet).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.getAll();

      expect(result.list).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.list[0].name).toBe('Test Source');
      expect(result.list[0].type).toBe('douyin_api'); // normalized to lowercase
    });

    it('should fetch data sources with filters', async () => {
      const mockResponse = {
        data: {
          items: [{ id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'ACTIVE' }],
          total: 1,
        },
      };
      vi.mocked(authGet).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.getAll({
        name: 'Test',
        type: 'douyin_api',
        status: 'active',
        page: 1,
        pageSize: 10,
      });

      expect(authGet).toHaveBeenCalledWith(
        expect.stringContaining('name=Test')
      );
      expect(result.list).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should fetch single data source', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'ACTIVE' },
      };
      vi.mocked(authGet).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.getById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Source');
      expect(result.type).toBe('douyin_api');
    });
  });

  describe('create', () => {
    it('should create data source', async () => {
      const mockData = {
        name: 'New Source',
        type: 'douyin_api' as const,
        config: { apiKey: 'test' },
      };
      const mockResponse = {
        data: { id: 1, name: 'New Source', type: 'DOUYIN_API', status: 'ACTIVE' },
      };
      vi.mocked(authPost).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.create(mockData);

      expect(authPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          name: 'New Source',
          type: 'DOUYIN_API', // Should be uppercased
        })
      );
      expect(result.id).toBe(1);
      expect(result.name).toBe('New Source');
    });
  });

  describe('update', () => {
    it('should update data source', async () => {
      const mockData = { name: 'Updated Source' };
      const mockResponse = {
        data: { id: 1, name: 'Updated Source', type: 'DOUYIN_API', status: 'ACTIVE' },
      };
      vi.mocked(authPut).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.update(1, mockData);

      expect(authPut).toHaveBeenCalledWith(expect.any(String), mockData);
      expect(result.name).toBe('Updated Source');
    });
  });

  describe('delete', () => {
    it('should delete data source', async () => {
      vi.mocked(authDel).mockResolvedValue({ data: undefined });

      await dataSourceApi.delete(1);

      expect(authDel).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('activate', () => {
    it('should activate data source', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'ACTIVE' },
      };
      vi.mocked(authPost).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.activate(1, true);

      expect(result.status).toBe('active');
    });

    it('should deactivate data source', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'INACTIVE' },
      };
      vi.mocked(authPost).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.activate(1, false);

      expect(result.status).toBe('inactive');
    });
  });

  describe('getRules', () => {
    it('should fetch rules for data source', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'Test Rule', rule_type: 'ORDERS' }],
      };
      vi.mocked(authGet).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.getRules(1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Rule');
    });
  });

  describe('validateConnection', () => {
    it('should validate connection', async () => {
      const mockResponse = {
        data: { valid: true, message: 'Connection successful' },
      };
      vi.mocked(authPost).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.validateConnection(1, {});

      expect(result.success).toBe(true);
      expect(result.message).toBe('Connection successful');
    });
  });
});
