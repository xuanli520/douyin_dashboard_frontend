import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock the api-client
vi.mock('@/lib/api-client', () => ({
  authGet: vi.fn(),
  authPost: vi.fn(),
  authPut: vi.fn(),
  authDel: vi.fn(),
}));

// 导入被测试的模块和 mock
import { useDataSources } from '../useDataSources';
import { authGet } from '@/lib/api-client';

describe('useDataSources', () => {
  const mockData = {
    data: {
      items: [{ id: 1, name: 'Test Source', type: 'DOUYIN_API', status: 'ACTIVE', config: {}, created_at: '', updated_at: '' }],
      total: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authGet).mockResolvedValue(mockData);
  });

  it('should fetch data immediately by default', async () => {
    const { result } = renderHook(() => useDataSources());

    // 等待 API 被调用
    await waitFor(() => {
      expect(authGet).toHaveBeenCalled();
    }, { timeout: 2000 });

    // 等待加载完成
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    expect(result.current.data.list).toHaveLength(1);
  });

  it('should not fetch data when immediate is false', async () => {
    const { result } = renderHook(() => useDataSources(undefined, { immediate: false }));

    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(authGet).not.toHaveBeenCalled();
    expect(result.current.data.list).toHaveLength(0);
  });

  it('should support manual fetch with fetchData', async () => {
    const { result } = renderHook(() => useDataSources(undefined, { immediate: false }));

    await act(async () => {
      await result.current.fetchData();
    });

    expect(authGet).toHaveBeenCalled();
    expect(result.current.data.list).toHaveLength(1);
  });

  it('should support refetch', async () => {
    const { result } = renderHook(() => useDataSources());

    // 等待首次加载完成
    await waitFor(() => {
      expect(authGet).toHaveBeenCalled();
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    vi.mocked(authGet).mockClear();
    
    await act(async () => {
      await result.current.refetch();
    });

    expect(authGet).toHaveBeenCalled();
  });
});
