'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { collectionJobApi } from '@/features/collection-job/services/collectionJobApi';
import { dataSourceApi } from '@/features/data-source/services/dataSourceApi';
import { useAuthStore } from '@/stores/authStore';
import { usePermissionStore } from '@/stores/permissionStore';
import {
  CollectionJobCreate,
  CollectionJobResponse,
  CollectionJobStatus,
  CollectionJobTaskType,
  DataSourceResponse,
  ScrapingRuleListItem,
} from '@/types';
import { ROUTES } from '@/config/routes';

interface CollectionJobFormState {
  name: string;
  task_type: CollectionJobTaskType;
  data_source_id: string;
  rule_id: string;
  cron: string;
  timezone: string;
  kwargs: string;
  status: CollectionJobStatus;
}

const DEFAULT_FORM: CollectionJobFormState = {
  name: '',
  task_type: 'SHOP_DASHBOARD_COLLECTION',
  data_source_id: '',
  rule_id: '',
  cron: '',
  timezone: 'Asia/Shanghai',
  kwargs: '{}',
  status: 'ACTIVE',
};

const TASK_TYPE_LABELS: Record<CollectionJobTaskType, string> = {
  ETL_ORDERS: '订单 ETL',
  ETL_PRODUCTS: '商品 ETL',
  SHOP_DASHBOARD_COLLECTION: '店铺看板采集',
};

const STATUS_LABELS: Record<CollectionJobStatus, string> = {
  ACTIVE: '启用',
  INACTIVE: '停用',
};

const DATA_SOURCE_EMPTY_VALUE = '__data_source_empty__';
const RULE_EMPTY_VALUE = '__rule_empty__';
const RULE_LOADING_VALUE = '__rule_loading__';
const RULE_NEED_DATA_SOURCE_VALUE = '__rule_need_data_source__';

function parsePositiveInt(value: string): number | null {
  const normalized = Number(value.trim());
  if (!Number.isInteger(normalized) || normalized <= 0) {
    return null;
  }
  return normalized;
}

function normalizeCronExpression(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function hasValidCronFieldCount(value: string): boolean {
  const fields = value.split(' ').filter(Boolean);
  return fields.length === 5 || fields.length === 6;
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  const text = value.trim();
  if (!text) {
    return {};
  }

  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function statusVariant(status: CollectionJobStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'ACTIVE') {
    return 'secondary';
  }
  return 'outline';
}

function toLocalTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function formatJsonCompact(value: Record<string, unknown>): string {
  const keys = Object.keys(value);
  if (keys.length === 0) {
    return '{}';
  }
  return JSON.stringify(value);
}

function parsePrefill(searchParams: URLSearchParams): Partial<CollectionJobFormState> | null {
  const dataSourceId = searchParams.get('data_source_id');
  const ruleId = searchParams.get('rule_id');
  const taskType = searchParams.get('task_type');
  const normalizedDataSourceId = dataSourceId ? parsePositiveInt(dataSourceId) : null;
  const normalizedRuleId = ruleId ? parsePositiveInt(ruleId) : null;

  if (!normalizedDataSourceId || !normalizedRuleId) {
    return null;
  }

  return {
    data_source_id: String(normalizedDataSourceId),
    rule_id: String(normalizedRuleId),
    task_type: taskType === 'SHOP_DASHBOARD_COLLECTION'
      ? 'SHOP_DASHBOARD_COLLECTION'
      : DEFAULT_FORM.task_type,
  };
}

function formatDataSourceOption(dataSource: DataSourceResponse): string {
  return `${dataSource.name} (ID: ${dataSource.id})`;
}

function formatRuleOption(rule: ScrapingRuleListItem): string {
  return `${rule.name} (ID: ${rule.id})`;
}

export default function CollectionJobConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collectionJobs, setCollectionJobs] = useState<CollectionJobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CollectionJobFormState>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataSources, setDataSources] = useState<DataSourceResponse[]>([]);
  const [isDataSourcesLoading, setIsDataSourcesLoading] = useState(false);
  const [rules, setRules] = useState<ScrapingRuleListItem[]>([]);
  const [isRulesLoading, setIsRulesLoading] = useState(false);
  const [rulesLoadFailed, setRulesLoadFailed] = useState(false);
  const formRef = useRef(form);

  const { isAuthenticated } = useAuthStore();
  const { isSuperuser, checkPermission } = usePermissionStore();
  const canViewCollectionJobs = isAuthenticated && (isSuperuser || checkPermission('data_source:view'));
  const canCreateCollectionJobs = isAuthenticated && (isSuperuser || checkPermission('data_source:create'));
  const selectedDataSourceId = useMemo(() => parsePositiveInt(form.data_source_id), [form.data_source_id]);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const fetchCollectionJobs = useCallback(async () => {
    if (!canViewCollectionJobs) {
      setCollectionJobs([]);
      return;
    }

    setIsLoading(true);
    try {
      const jobs = await collectionJobApi.list();
      setCollectionJobs(jobs);
    } catch (error) {
      setCollectionJobs([]);
      toast.error(error instanceof Error ? error.message : '定时任务列表加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [canViewCollectionJobs]);

  useEffect(() => {
    void fetchCollectionJobs();
  }, [fetchCollectionJobs]);

  useEffect(() => {
    if (!canCreateCollectionJobs) {
      return;
    }

    const prefill = parsePrefill(new URLSearchParams(searchParams.toString()));
    if (!prefill) {
      return;
    }

    setForm(prev => ({ ...prev, ...prefill }));
    setDialogOpen(true);
  }, [canCreateCollectionJobs, searchParams]);

  useEffect(() => {
    if (!dialogOpen || !canCreateCollectionJobs) {
      setDataSources([]);
      setIsDataSourcesLoading(false);
      return;
    }

    let active = true;
    setIsDataSourcesLoading(true);

    void dataSourceApi.getAll({ page: 1, size: 100 })
      .then(response => {
        if (!active) {
          return;
        }
        setDataSources(response.items);
      })
      .catch(error => {
        if (!active) {
          return;
        }
        setDataSources([]);
        toast.error(error instanceof Error ? error.message : '数据源加载失败');
      })
      .finally(() => {
        if (active) {
          setIsDataSourcesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [canCreateCollectionJobs, dialogOpen]);

  useEffect(() => {
    if (!dialogOpen || !canCreateCollectionJobs || !selectedDataSourceId) {
      setRules([]);
      setIsRulesLoading(false);
      setRulesLoadFailed(false);
      return;
    }

    let active = true;
    setIsRulesLoading(true);
    setRulesLoadFailed(false);

    void dataSourceApi.getScrapingRules(selectedDataSourceId)
      .then(nextRules => {
        if (!active) {
          return;
        }
        setRules(nextRules);

        const prefilledRuleId = formRef.current.rule_id;
        if (!prefilledRuleId) {
          return;
        }
        const ruleExists = nextRules.some(rule => String(rule.id) === prefilledRuleId);
        if (ruleExists) {
          return;
        }

        setForm(prev => (prev.rule_id ? { ...prev, rule_id: '' } : prev));
        toast.error('当前数据源下不存在该采集规则，请重新选择');
      })
      .catch(error => {
        if (!active) {
          return;
        }
        setRules([]);
        setRulesLoadFailed(true);
        toast.error(error instanceof Error ? error.message : '采集规则加载失败');
      })
      .finally(() => {
        if (active) {
          setIsRulesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [canCreateCollectionJobs, dialogOpen, selectedDataSourceId]);

  const handleDialogChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setForm(DEFAULT_FORM);
      setDataSources([]);
      setRules([]);
      setRulesLoadFailed(false);
    }
  }, []);

  const handleOpenCreateDialog = useCallback(() => {
    setForm(DEFAULT_FORM);
    setRules([]);
    setRulesLoadFailed(false);
    setDialogOpen(true);
  }, []);

  const handleDataSourceChange = useCallback((value: string) => {
    setForm(prev => ({
      ...prev,
      data_source_id: value,
      rule_id: '',
    }));
  }, []);

  const handleRuleChange = useCallback((value: string) => {
    setForm(prev => ({
      ...prev,
      rule_id: value,
    }));
  }, []);

  const handleCreateCollectionJob = useCallback(async () => {
    if (!canCreateCollectionJobs) {
      toast.error('缺少 data_source:create 权限');
      return;
    }

    const name = form.name.trim();
    if (!name) {
      toast.error('请输入任务名称');
      return;
    }

    const dataSourceId = parsePositiveInt(form.data_source_id);
    if (!dataSourceId) {
      toast.error('请选择数据源');
      return;
    }

    const ruleId = parsePositiveInt(form.rule_id);
    if (!ruleId) {
      toast.error('请选择采集规则');
      return;
    }

    const cron = normalizeCronExpression(form.cron);
    if (!cron) {
      toast.error('请输入 cron');
      return;
    }
    if (!hasValidCronFieldCount(cron)) {
      toast.error('cron 仅支持 5 或 6 段');
      return;
    }

    const timezone = form.timezone.trim() || 'Asia/Shanghai';
    const kwargs = parseJsonObject(form.kwargs);
    if (!kwargs) {
      toast.error('kwargs 必须是 JSON 对象');
      return;
    }

    const payload: CollectionJobCreate = {
      name,
      task_type: form.task_type,
      data_source_id: dataSourceId,
      rule_id: ruleId,
      schedule: {
        cron,
        timezone,
        kwargs,
      },
      status: form.status,
    };

    setIsSubmitting(true);
    try {
      await collectionJobApi.create(payload);
      toast.success('定时任务创建成功');
      setDialogOpen(false);
      setForm(DEFAULT_FORM);
      await fetchCollectionJobs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '定时任务创建失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [canCreateCollectionJobs, fetchCollectionJobs, form]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.TASK_SCHEDULE)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <h2 className="text-xl font-semibold">定时任务配置</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchCollectionJobs()}
            disabled={!canViewCollectionJobs || isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button size="sm" onClick={handleOpenCreateDialog} disabled={!canCreateCollectionJobs}>
            <Plus className="mr-2 h-4 w-4" />
            创建定时任务
          </Button>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/30">
        <div className="border-b border-slate-200 px-4 py-3 text-sm text-muted-foreground dark:border-slate-800">
          仅展示 ACTIVE 任务，创建或修改后需重启 beat 才会生效。
        </div>

        <div className="overflow-auto">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>任务类型</TableHead>
                <TableHead>data_source_id</TableHead>
                <TableHead>rule_id</TableHead>
                <TableHead>Cron</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Kwargs</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!canViewCollectionJobs && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    缺少 data_source:view 权限，无法查看定时任务。
                  </TableCell>
                </TableRow>
              )}

              {canViewCollectionJobs && isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    加载中...
                  </TableCell>
                </TableRow>
              )}

              {canViewCollectionJobs && !isLoading && collectionJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    暂无定时任务
                  </TableCell>
                </TableRow>
              )}

              {canViewCollectionJobs && !isLoading && collectionJobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.name}</TableCell>
                  <TableCell>{TASK_TYPE_LABELS[job.task_type]}</TableCell>
                  <TableCell className="font-mono text-xs">{job.data_source_id}</TableCell>
                  <TableCell className="font-mono text-xs">{job.rule_id}</TableCell>
                  <TableCell className="font-mono text-xs">{job.schedule.cron || '-'}</TableCell>
                  <TableCell className="font-mono text-xs">{job.schedule.timezone || '-'}</TableCell>
                  <TableCell className="font-mono text-xs">{formatJsonCompact(job.schedule.kwargs)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(job.status)}>
                      {STATUS_LABELS[job.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{toLocalTime(job.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>创建定时任务</DialogTitle>
            <DialogDescription>
              调度配置写入 collection_jobs.schedule，创建或修改后需重启 beat 才会生效。
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4 py-2"
            onSubmit={event => {
              event.preventDefault();
              void handleCreateCollectionJob();
            }}
          >
            <div className="grid gap-2">
              <span className="text-sm font-medium">任务名称</span>
              <Input
                value={form.name}
                onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
                placeholder="例如：shop-dashboard-collection-1"
                disabled={isSubmitting || !canCreateCollectionJobs}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <span className="text-sm font-medium">任务类型</span>
                <Select
                  value={form.task_type}
                  onValueChange={value => setForm(prev => ({ ...prev, task_type: value as CollectionJobTaskType }))}
                  disabled={isSubmitting || !canCreateCollectionJobs}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHOP_DASHBOARD_COLLECTION">
                      {TASK_TYPE_LABELS.SHOP_DASHBOARD_COLLECTION}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium">状态</span>
                <Select
                  value={form.status}
                  onValueChange={value => setForm(prev => ({ ...prev, status: value as CollectionJobStatus }))}
                  disabled={isSubmitting || !canCreateCollectionJobs}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{STATUS_LABELS.ACTIVE}</SelectItem>
                    <SelectItem value="INACTIVE">{STATUS_LABELS.INACTIVE}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <span className="text-sm font-medium">数据源</span>
                <Select
                  value={form.data_source_id}
                  onValueChange={handleDataSourceChange}
                  disabled={isSubmitting || !canCreateCollectionJobs || isDataSourcesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isDataSourcesLoading ? '加载数据源中...' : '选择数据源'} />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.length === 0 && (
                      <SelectItem value={DATA_SOURCE_EMPTY_VALUE} disabled>
                        {isDataSourcesLoading ? '加载数据源中...' : '暂无可用数据源'}
                      </SelectItem>
                    )}
                    {dataSources.map(dataSource => (
                      <SelectItem key={dataSource.id} value={String(dataSource.id)}>
                        {formatDataSourceOption(dataSource)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium">采集规则</span>
                <Select
                  value={form.rule_id}
                  onValueChange={handleRuleChange}
                  disabled={
                    isSubmitting
                    || !canCreateCollectionJobs
                    || !selectedDataSourceId
                    || isRulesLoading
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedDataSourceId
                          ? '先选择数据源'
                          : isRulesLoading
                            ? '加载规则中...'
                            : '选择采集规则'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {!selectedDataSourceId && (
                      <SelectItem value={RULE_NEED_DATA_SOURCE_VALUE} disabled>
                        请先选择数据源
                      </SelectItem>
                    )}
                    {selectedDataSourceId && isRulesLoading && (
                      <SelectItem value={RULE_LOADING_VALUE} disabled>
                        加载规则中...
                      </SelectItem>
                    )}
                    {selectedDataSourceId && !isRulesLoading && rules.length === 0 && (
                      <SelectItem value={RULE_EMPTY_VALUE} disabled>
                        {rulesLoadFailed ? '规则加载失败，请切换数据源重试' : '该数据源下暂无规则'}
                      </SelectItem>
                    )}
                    {selectedDataSourceId && !isRulesLoading && rules.map(rule => (
                      <SelectItem key={rule.id} value={String(rule.id)}>
                        {formatRuleOption(rule)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <span className="text-sm font-medium">Cron</span>
                <Input
                  value={form.cron}
                  onChange={event => setForm(prev => ({ ...prev, cron: event.target.value }))}
                  placeholder="例如：0 */10 * * * *"
                  disabled={isSubmitting || !canCreateCollectionJobs}
                />
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium">Timezone</span>
                <Input
                  value={form.timezone}
                  onChange={event => setForm(prev => ({ ...prev, timezone: event.target.value }))}
                  placeholder="Asia/Shanghai"
                  disabled={isSubmitting || !canCreateCollectionJobs}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Kwargs (JSON)</span>
              <Textarea
                value={form.kwargs}
                onChange={event => setForm(prev => ({ ...prev, kwargs: event.target.value }))}
                rows={6}
                className="font-mono text-xs"
                placeholder='{"force_full": false}'
                disabled={isSubmitting || !canCreateCollectionJobs}
              />
            </div>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleDialogChange(false)} disabled={isSubmitting}>
              取消
            </Button>
            <Button
              type="button"
              onClick={() => void handleCreateCollectionJob()}
              disabled={isSubmitting || !canCreateCollectionJobs || isDataSourcesLoading || isRulesLoading}
            >
              {isSubmitting ? '创建中...' : '创建任务'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
