import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock the api-client
const mockAuthGet = vi.fn();

vi.mock('@/lib/api-client', () => ({
  authGet: (...args: any[]) => mockAuthGet(...args),
  authPost: vi.fn(),
  authPut: vi.fn(),
  authDel: vi.fn(),
}));

import { useDataSources } from '../useDataSources';

describe('useDataSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthGet.mockReset();
    mockAuthGet.mockResolvedValue({ 
      data: { 
        items: [{ id: 1, name: 'Test', type: 'DOUYIN_API', status: 'ACTIVE', config: {} }], 
        total: 1 
      } 
    });
  });

  it('should render without immediate fetch', () => {
    const { result } = renderHook(() => useDataSources(undefined, { immediate: false }));
    
    expect(result.current.data.list).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(mockAuthGet).not.toHaveBeenCalled();
  });
});
