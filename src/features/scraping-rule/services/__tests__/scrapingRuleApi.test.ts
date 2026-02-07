import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapingRuleApi } from '../scrapingRuleApi';

// Mock the api-client
vi.mock('@/lib/api-client', () => ({
  authGet: vi.fn(),
  authPost: vi.fn(),
  authPatch: vi.fn(),
  authDel: vi.fn(),
  authPut: vi.fn(),
  ApiResponse: {},
}));

// Mock the config
vi.mock('@/config/api', () => ({
  API_ENDPOINTS: {
    SCRAPING_RULES: '/api/scraping-rules',
    SCRAPING_RULE_DETAIL: (id: number) => `/api/scraping-rules/${id}`,
  },
}));

import { authGet, authPost, authPatch, authDel, authPut } from '@/lib/api-client';

describe('scrapingRuleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch scraping rules list', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: 1, name: 'Test Rule', rule_type: 'ORDERS', is_active: true },
            { id: 2, name: 'Another Rule', rule_type: 'PRODUCTS', is_active: false },
          ],
          total: 2,
          page: 1,
          size: 10,
          pages: 1,
        },
      };
      vi.mocked(authGet).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.getAll();

      expect(result.list).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.list[0].name).toBe('Test Rule');
      expect(result.list[0].rule_type).toBe('orders'); // normalized to lowercase
    });

    it('should fetch scraping rules with filters', async () => {
      const mockResponse = {
        data: {
          items: [{ id: 1, name: 'Test Rule', rule_type: 'ORDERS', is_active: true }],
          total: 1,
          page: 1,
          size: 10,
          pages: 1,
        },
      };
      vi.mocked(authGet).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.getAll({
        name: 'Test',
        rule_type: 'orders',
        data_source_id: 1,
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
    it('should fetch single scraping rule', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Rule', rule_type: 'ORDERS', is_active: true },
      };
      vi.mocked(authGet).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.getById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Rule');
      expect(result.rule_type).toBe('orders');
    });
  });

  describe('create', () => {
    it('should create scraping rule', async () => {
      const mockData = {
        name: 'New Rule',
        rule_type: 'orders' as const,
        data_source_id: 1,
        schedule_type: 'once' as const,
        schedule_value: '0 0 * * *',
        config: { selectors: {} },
      };
      const mockResponse = {
        data: { id: 1, name: 'New Rule', rule_type: 'ORDERS', is_active: true },
      };
      vi.mocked(authPost).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.create(mockData);

      expect(authPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          name: 'New Rule',
          rule_type: 'ORDERS', // Should be uppercased
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
        data: { id: 1, name: 'Updated Rule', rule_type: 'ORDERS', is_active: true },
      };
      vi.mocked(authPatch).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.update(1, mockData);

      expect(authPatch).toHaveBeenCalledWith(expect.any(String), mockData);
      expect(result.name).toBe('Updated Rule');
    });

    it('should update scraping rule with type', async () => {
      const mockData = { name: 'Updated Rule', rule_type: 'products' as const };
      const mockResponse = {
        data: { id: 1, name: 'Updated Rule', rule_type: 'PRODUCTS', is_active: true },
      };
      vi.mocked(authPatch).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.update(1, mockData);

      expect(authPatch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          rule_type: 'PRODUCTS', // Should be uppercased
        })
      );
      expect(result.rule_type).toBe('products');
    });
  });

  describe('delete', () => {
    it('should delete scraping rule', async () => {
      vi.mocked(authDel).mockResolvedValue({ data: undefined });

      await scrapingRuleApi.delete(1);

      expect(authDel).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('activate', () => {
    it('should activate scraping rule', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Rule', rule_type: 'ORDERS', is_active: true },
      };
      vi.mocked(authPut).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.activate(1, true);

      expect(authPut).toHaveBeenCalledWith(
        expect.any(String),
        { is_active: true }
      );
      expect(result.is_active).toBe(true);
    });

    it('should deactivate scraping rule', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Rule', rule_type: 'ORDERS', is_active: false },
      };
      vi.mocked(authPut).mockResolvedValue(mockResponse);

      const result = await scrapingRuleApi.activate(1, false);

      expect(authPut).toHaveBeenCalledWith(
        expect.any(String),
        { is_active: false }
      );
      expect(result.is_active).toBe(false);
    });
  });
});
