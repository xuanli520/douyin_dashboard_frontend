import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataSourceApi } from '../dataSourceApi';

// Mock the http client
vi.mock('@/lib/http/client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
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
    DATA_SOURCE_SCRAPING_RULES: (id: number) => `/api/data-sources/${id}/scraping-rules`,
  },
}));

import { httpClient } from '@/lib/http/client';

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
          meta: { page: 1, size: 10, total: 2, pages: 1, has_next: false, has_prev: false },
        },
      };
      vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.getAll();

      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.items[0].name).toBe('Test Source');
    });

    it('should fetch data sources with filters', async () => {
      const mockResponse = {
        data: {
          items: [{ id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'ACTIVE' }],
          meta: { page: 1, size: 10, total: 1, pages: 1, has_next: false, has_prev: false },
        },
      };
      vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.getAll({
        name: 'Test',
        page: 1,
        size: 10,
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('name=Test')
      );
      expect(result.items).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should fetch single data source', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'ACTIVE' },
      };
      vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.getById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Source');
    });
  });

  describe('create', () => {
    it('should create data source', async () => {
      const mockData = {
        name: 'New Source',
        type: 'DOUYIN_API' as const,
        config: { apiKey: 'test' },
      };
      const mockResponse = {
        data: { id: 1, name: 'New Source', type: 'DOUYIN_API', status: 'ACTIVE' },
      };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.create(mockData);

      expect(httpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          name: 'New Source',
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
      vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.update(1, mockData);

      expect(httpClient.put).toHaveBeenCalledWith(expect.any(String), mockData);
      expect(result.name).toBe('Updated Source');
    });
  });

  describe('delete', () => {
    it('should delete data source', async () => {
      vi.mocked(httpClient.delete).mockResolvedValue({ data: undefined });

      await dataSourceApi.delete(1);

      expect(httpClient.delete).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('activate', () => {
    it('should activate data source', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'ACTIVE' },
      };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.activate(1);

      expect(result.status).toBe('ACTIVE');
    });

    it('should deactivate data source', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'INACTIVE' },
      };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.deactivate(1);

      expect(result.status).toBe('INACTIVE');
    });
  });

  describe('getScrapingRules', () => {
    it('should fetch rules for data source', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'Test Rule', target_type: 'SHOP_OVERVIEW' }],
      };
      vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.getScrapingRules(1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Rule');
    });
  });

  describe('validate', () => {
    it('should validate connection', async () => {
      const mockResponse = {
        data: { valid: true, message: 'Connection successful' },
      };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await dataSourceApi.validate(1);

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Connection successful');
    });
  });
});
