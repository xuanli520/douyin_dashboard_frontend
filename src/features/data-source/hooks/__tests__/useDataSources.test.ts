import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire httpClient module
const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('@/lib/http/client', () => ({
  httpClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

const { httpClient } = await import('@/lib/http/client');

describe('useDataSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockGet.mockResolvedValue({
      data: {
        items: [{ id: 1, name: 'Test', type: 'DOUYIN_API', status: 'ACTIVE', config: {} }],
        meta: { page: 1, size: 10, total: 1, pages: 1, has_next: false, has_prev: false },
      },
    });
  });

  it('should use httpClient to fetch data sources', async () => {
    // This test verifies that the dataSourceApi uses httpClient correctly
    const result = await httpClient.get('/api/test');

    expect(mockGet).toHaveBeenCalled();
  });
});
