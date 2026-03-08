'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search, Terminal, RefreshCw } from 'lucide-react';
import { CyberButton } from '@/components/ui/cyber/CyberButton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/app/components/ui/table';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import {
  ShopDashboardTaskStatus,
  ShopDashboardStatusResponse,
  BatchTriggerRequest,
} from '@/features/shop-dashboard/services/types';
import { shopDashboardApi } from '@/features/shop-dashboard/services/shopDashboardApi';

interface TaskQueueItem {
  task_id: string;
  shop_id?: string;
  rule_ids?: number[];
  status: ShopDashboardTaskStatus;
  progress?: number;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  error_message?: string;
}

const LOCAL_QUEUE_KEY = 'shop-dashboard-task-queue';
const FINAL_STATUS: ReadonlySet<ShopDashboardTaskStatus> = new Set(['SUCCESS', 'FAILURE', 'REVOKED']);

function normalizeTaskStatus(status?: string): ShopDashboardTaskStatus {
  if (!status) {
    return 'PENDING';
  }
  const value = status.toUpperCase();
  if (['PENDING', 'QUEUED', 'STARTED', 'SUCCESS', 'FAILURE', 'RETRY', 'REVOKED'].includes(value)) {
    return value as ShopDashboardTaskStatus;
  }
  return 'UNKNOWN';
}

function parseRuleIds(rawRuleIds: string): number[] {
  const set = new Set<number>();
  for (const part of rawRuleIds.split(',')) {
    const numeric = Number(part.trim());
    if (Number.isInteger(numeric) && numeric > 0) {
      set.add(numeric);
    }
  }
  return Array.from(set);
}

function getStatusVariant(status: ShopDashboardTaskStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'SUCCESS') {
    return 'secondary';
  }
  if (status === 'FAILURE' || status === 'REVOKED') {
    return 'destructive';
  }
  if (status === 'STARTED' || status === 'RETRY') {
    return 'default';
  }
  return 'outline';
}

function getDefaultDateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { start: format(start), end: format(end) };
}

export default function TaskSchedulePage() {
  const defaultRange = getDefaultDateRange();

  const [shopId, setShopId] = useState('');
  const [ruleIdsText, setRuleIdsText] = useState('');
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [keyword, setKeyword] = useState('');

  const [tasks, setTasks] = useState<TaskQueueItem[]>([]);
  const [triggering, setTriggering] = useState(false);

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ShopDashboardStatusResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_QUEUE_KEY);
      if (!cached) {
        return;
      }
      const parsed = JSON.parse(cached) as TaskQueueItem[];
      if (Array.isArray(parsed)) {
        setTasks(parsed);
      }
    } catch {
      localStorage.removeItem(LOCAL_QUEUE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const activeTaskIds = useMemo(
    () => tasks.filter(task => !FINAL_STATUS.has(task.status)).map(task => task.task_id),
    [tasks]
  );

  useEffect(() => {
    if (activeTaskIds.length === 0) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      const results = await Promise.all(
        activeTaskIds.map(async taskId => {
          try {
            return await shopDashboardApi.getTaskStatus(taskId);
          } catch {
            return null;
          }
        })
      );

      if (cancelled) {
        return;
      }

      const statusMap = new Map(results.filter(Boolean).map(item => [item!.task_id, item!]));
      setTasks(prev =>
        prev.map(task => {
          const latest = statusMap.get(task.task_id);
          if (!latest) {
            return task;
          }
          return {
            ...task,
            status: latest.status,
            progress: latest.progress,
            started_at: latest.started_at,
            finished_at: latest.finished_at,
            error_message: latest.error_message,
          };
        })
      );
    };

    const timer = window.setInterval(() => {
      void poll();
    }, 5000);

    void poll();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeTaskIds]);

  const loadTaskDetail = async (taskId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await shopDashboardApi.getShopDashboardStatus(taskId);
      setDetailData(detail);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '任务详情获取失败');
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (!detailTaskId) {
      setDetailData(null);
      return;
    }
    void loadTaskDetail(detailTaskId);
  }, [detailTaskId]);

  const handleTrigger = async () => {
    const ruleIds = parseRuleIds(ruleIdsText);
    const payload: BatchTriggerRequest = {};

    if (shopId.trim()) {
      payload.shop_id = shopId.trim();
    }
    if (ruleIds.length > 0) {
      payload.rule_ids = ruleIds;
    }
    if (startDate) {
      payload.start_date = startDate;
    }
    if (endDate) {
      payload.end_date = endDate;
    }

    if (!payload.shop_id && !payload.rule_ids?.length) {
      toast.error('请至少填写店铺 ID 或规则 ID');
      return;
    }

    setTriggering(true);
    try {
      const result = await shopDashboardApi.batchTrigger(payload);
      const newTask: TaskQueueItem = {
        task_id: result.task_id,
        shop_id: payload.shop_id,
        rule_ids: payload.rule_ids,
        status: normalizeTaskStatus(result.status),
        created_at: result.accepted_at || new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev.filter(task => task.task_id !== newTask.task_id)]);
      toast.success(`触发成功，任务 ID: ${result.task_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '触发任务失败');
    } finally {
      setTriggering(false);
    }
  };

  const filteredTasks = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) {
      return tasks;
    }

    return tasks.filter(task => {
      const hitTaskId = task.task_id.toLowerCase().includes(text);
      const hitShopId = task.shop_id?.toLowerCase().includes(text);
      const hitRuleIds = (task.rule_ids || []).join(',').includes(text);
      return hitTaskId || hitShopId || hitRuleIds;
    });
  }, [keyword, tasks]);

  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 relative flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">采集任务中心</h2>
        <CyberButton className="shadow-lg shadow-cyan-500/20 group" onClick={handleTrigger} disabled={triggering}>
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          {triggering ? '触发中...' : '触发采集'}
        </CyberButton>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <Input
          placeholder="店铺 ID（可选）"
          value={shopId}
          onChange={event => setShopId(event.target.value)}
        />
        <Input
          placeholder="规则 ID，逗号分隔"
          value={ruleIdsText}
          onChange={event => setRuleIdsText(event.target.value)}
        />
        <Input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} />
        <Input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} />
        <Button variant="outline" onClick={handleTrigger} disabled={triggering}>
          立即触发
        </Button>
      </div>

      <div className="filter-bar-container flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="搜索任务 ID / 店铺 / 规则"
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            className="filter-input h-9 w-[280px] pl-9 pr-4 text-sm focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>任务 ID</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>店铺 ID</TableHead>
              <TableHead>规则 ID</TableHead>
              <TableHead>进度</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map(task => (
              <TableRow key={task.task_id}>
                <TableCell className="font-mono text-xs">{task.task_id}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                </TableCell>
                <TableCell className="font-mono">{task.shop_id || '-'}</TableCell>
                <TableCell className="font-mono">{task.rule_ids?.join(', ') || '-'}</TableCell>
                <TableCell>{typeof task.progress === 'number' ? `${Math.round(task.progress)}%` : '-'}</TableCell>
                <TableCell>{new Date(task.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDetailTaskId(task.task_id)}
                    className="h-8 px-2"
                  >
                    <Terminal className="h-4 w-4 mr-1" />
                    详情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  暂无任务
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(detailTaskId)} onOpenChange={open => !open && setDetailTaskId(null)}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>任务详情</span>
              {detailTaskId && (
                <Button variant="outline" size="sm" onClick={() => loadTaskDetail(detailTaskId)} disabled={loadingDetail}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingDetail ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {loadingDetail && <div className="py-8 text-center text-sm text-muted-foreground">加载中...</div>}

          {!loadingDetail && detailData && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-muted-foreground">任务 ID</div>
                  <div className="font-mono break-all">{detailData.task_id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">状态</div>
                  <Badge variant={getStatusVariant(detailData.status)}>{detailData.status}</Badge>
                </div>
                <div>
                  <div className="text-muted-foreground">步骤</div>
                  <div>{detailData.step || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">进度</div>
                  <div>{typeof detailData.progress === 'number' ? `${Math.round(detailData.progress)}%` : '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">开始时间</div>
                  <div>{detailData.started_at ? new Date(detailData.started_at).toLocaleString() : '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">结束时间</div>
                  <div>{detailData.finished_at ? new Date(detailData.finished_at).toLocaleString() : '-'}</div>
                </div>
              </div>

              {detailData.error_message && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-red-600">
                  {detailData.error_message}
                </div>
              )}

              {detailData.logs && detailData.logs.length > 0 && (
                <div>
                  <div className="mb-2 text-muted-foreground">日志</div>
                  <div className="max-h-48 overflow-auto rounded bg-slate-950 p-3 font-mono text-xs text-slate-100">
                    {detailData.logs.map((line, index) => (
                      <div key={`${line}-${index}`}>{line}</div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-2 text-muted-foreground">原始响应</div>
                <div className="max-h-64 overflow-auto rounded bg-slate-950 p-3 font-mono text-xs text-slate-100">
                  <pre>{JSON.stringify(detailData.raw, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
