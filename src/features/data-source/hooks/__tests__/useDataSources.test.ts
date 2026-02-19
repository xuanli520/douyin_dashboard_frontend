import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDataSources } from '../useDataSources';
import { dataSourceApi } from '../../services/dataSourceApi';

vi.mock('next/navigation', () => ({
  usePathname: () => '/data-sources',
}));

vi.mock('../../services/dataSourceApi', () => ({
  dataSourceApi: {
    getAll: vi.fn(),
  },
}));

describe('useDataSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataSourceApi.getAll).mockResolvedValue({
      items: [],
      meta: {
        page: 1,
        size: 10,
        total: 0,
        pages: 0,
        has_next: false,
        has_prev: false,
      },
    });
  });

  it('should initialize with empty items', () => {
    const { result } = renderHook(() => useDataSources());

    expect(result.current.data.items).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
