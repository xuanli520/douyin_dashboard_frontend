import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapingRuleApi } from '../scrapingRuleApi';

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
    SCRAPING_RULES: '/api/scraping-rules',
    SCRAPING_RULE_DETAIL: (id: number) => `/api/scraping-rules/${id}`,
  },
}));

import { httpClient } from '@/lib/http/client';

describe('scrapingRuleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch scraping rules list', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: 1, name: 'Test Rule', target_type: 'SHOP_OVERVIEW', is_active: true },
            { id: 2, name: 'Another Rule', target_type: 'PRODUCT', is_active: false },
          ],
          meta: { page: 1, size: 10, total: 2, pages: 1, has_next: false, has_prev: false },
        },
      };
      vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.getAll();

      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.items[0].name).toBe('Test Rule');
    });

    it('should fetch scraping rules with filters', async () => {
      const mockResponse = {
        data: {
          items: [{ id: 1, name: 'Test Rule', target_type: 'SHOP_OVERVIEW', is_active: true }],
          meta: { page: 1, size: 10, total: 1, pages: 1, has_next: false, has_prev: false },
        },
      };
      vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.getAll({
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
    it('should fetch single scraping rule', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Rule', target_type: 'SHOP_OVERVIEW', is_active: true },
      };
      vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.getById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Rule');
    });
  });

  describe('create', () => {
    it('should create scraping rule', async () => {
      const mockData = {
        name: 'New Rule',
        data_source_id: 1,
        target_type: 'SHOP_OVERVIEW' as const,
        config: {},
      };
      const mockResponse = {
        data: { id: 1, name: 'New Rule', target_type: 'SHOP_OVERVIEW', is_active: true },
      };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.create(mockData);

      expect(httpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          name: 'New Rule',
        })
      );
      expect(result.id).toBe(1);
      expect(result.name).toBe('New Rule');
    });
  });

  describe('update', () => {
    it('should update scraping rule', async () => {
      const mockData = { name: 'Updated Rule' };
      const mockResponse = {
        data: { id: 1, name: 'Updated Rule', target_type: 'SHOP_OVERVIEW', is_active: true },
      };
      vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.update(1, mockData);

      expect(httpClient.put).toHaveBeenCalledWith(expect.any(String), mockData);
      expect(result.name).toBe('Updated Rule');
    });
  });

  describe('delete', () => {
    it('should delete scraping rule', async () => {
      vi.mocked(httpClient.delete).mockResolvedValue({ data: undefined });

      await scrapingRuleApi.delete(1);

      expect(httpClient.delete).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('activate', () => {
    it('should activate scraping rule', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Rule', target_type: 'SHOP_OVERVIEW', is_active: true },
      };
      vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.activate(1);

      expect(httpClient.put).toHaveBeenCalledWith(
        expect.any(String),
        { is_active: true }
      );
      expect(result.is_active).toBe(true);
    });

    it('should deactivate scraping rule', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Rule', target_type: 'SHOP_OVERVIEW', is_active: false },
      };
      vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.deactivate(1);

      expect(httpClient.put).toHaveBeenCalledWith(
        expect.any(String),
        { is_active: false }
      );
      expect(result.is_active).toBe(false);
    });
  });
});
