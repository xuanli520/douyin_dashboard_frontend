import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TaskSchedulePage from '@/app/components/TaskSchedulePage';
import { shopDashboardApi } from '@/features/shop-dashboard/services/shopDashboardApi';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/features/shop-dashboard/services/shopDashboardApi', () => ({
  shopDashboardApi: {
    listTasks: vi.fn(),
    createTask: vi.fn(),
    getTask: vi.fn(),
    runTask: vi.fn(),
    cancelTask: vi.fn(),
    listTaskExecutions: vi.fn(),
    triggerShopDashboardCollection: vi.fn(),
    queryResults: vi.fn(),
  },
}));

const mockedApi = vi.mocked(shopDashboardApi);

function mockTaskList() {
  mockedApi.listTasks.mockResolvedValue({
    items: [
      {
        id: 101,
        name: 'orders-daily',
        task_type: 'ETL_ORDERS',
        status: 'ACTIVE',
        config: {},
        schedule: null,
        created_by_id: 1,
        updated_by_id: 1,
        created_at: '2026-03-09T01:00:00Z',
        updated_at: '2026-03-09T01:00:00Z',
      },
    ],
    meta: {
      page: 1,
      size: 20,
      total: 1,
      pages: 1,
      has_next: false,
      has_prev: false,
    },
  });
}

function mockTaskListWithShopCollection() {
  mockedApi.listTasks.mockResolvedValue({
    items: [
      {
        id: 202,
        name: 'shop-dashboard-collection',
        task_type: 'SHOP_DASHBOARD_COLLECTION',
        status: 'ACTIVE',
        config: {
          data_source_id: 66,
          rule_id: 77,
        },
        schedule: null,
        created_by_id: 1,
        updated_by_id: 1,
        created_at: '2026-03-09T01:00:00Z',
        updated_at: '2026-03-09T01:00:00Z',
      },
    ],
    meta: {
      page: 1,
      size: 20,
      total: 1,
      pages: 1,
      has_next: false,
      has_prev: false,
    },
  });
}

describe('TaskSchedulePage', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    mockTaskList();
  });

  it('加载后展示后端任务列表', async () => {
    render(<TaskSchedulePage />);

    expect(await screen.findByText('orders-daily')).toBeTruthy();
    expect(await screen.findByText('订单 ETL')).toBeTruthy();

    await waitFor(() => {
      expect(mockedApi.listTasks).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        status: undefined,
        task_type: undefined,
      });
    });
  });

  it('通过操作栏触发取消任务', async () => {
    mockedApi.cancelTask.mockResolvedValue({
      id: 101,
      name: 'orders-daily',
      task_type: 'ETL_ORDERS',
      status: 'CANCELLED',
      config: {},
      schedule: null,
      created_by_id: 1,
      updated_by_id: 1,
      created_at: '2026-03-09T01:00:00Z',
      updated_at: '2026-03-09T01:05:00Z',
    });

    render(<TaskSchedulePage />);

    await screen.findByText('orders-daily');
    fireEvent.pointerDown(screen.getByRole('button', { name: '打开操作菜单' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: '取消任务' }));

    await waitFor(() => {
      expect(mockedApi.cancelTask).toHaveBeenCalledWith(101);
    });
  });

  it('采集任务立即执行会自动使用任务配置参数触发', async () => {
    mockTaskListWithShopCollection();
    mockedApi.triggerShopDashboardCollection.mockResolvedValue({
      task: {
        id: 202,
        name: 'shop-dashboard-collection',
        task_type: 'SHOP_DASHBOARD_COLLECTION',
        status: 'ACTIVE',
        config: {},
        schedule: null,
        created_by_id: 1,
        updated_by_id: 1,
        created_at: '2026-03-09T01:00:00Z',
        updated_at: '2026-03-09T01:00:00Z',
      },
      execution: {
        id: 9001,
        task_id: 202,
        queue_task_id: 'queue-202-1',
        status: 'QUEUED',
        trigger_mode: 'MANUAL',
        payload: {
          data_source_id: 66,
          rule_id: 77,
        },
        started_at: null,
        completed_at: null,
        processed_rows: 0,
        error_message: null,
        triggered_by: 1,
        created_at: '2026-03-09T02:00:00Z',
        updated_at: '2026-03-09T02:00:00Z',
      },
    });

    render(<TaskSchedulePage />);

    await screen.findByText('shop-dashboard-collection');
    fireEvent.pointerDown(screen.getByRole('button', { name: '打开操作菜单' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: '立即执行' }));

    await waitFor(() => {
      expect(mockedApi.triggerShopDashboardCollection).toHaveBeenCalledWith({
        data_source_id: 66,
        rule_id: 77,
      });
    });
  });
});
