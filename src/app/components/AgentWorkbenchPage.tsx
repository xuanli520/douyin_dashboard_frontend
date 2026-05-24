'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, FileUp, Play, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { SecondaryPageLayout } from '@/app/components/layout/SecondaryPageLayout';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { agentApi } from '@/features/agent/services/agentApi';
import { AgentEvent, AgentResultItem, AgentResultsParams } from '@/features/agent/services/types';

const DEFAULT_GOAL = '发现抖店体验分单页采集路径';
const DEFAULT_ENTRYPOINT = 'https://fxg.jinritemai.com/tps/score/home';
const DEFAULT_NAMESPACE = 'douyin_shop_dashboard';
const DEFAULT_RECIPE_KEY = 'experience_score_single_page';

interface LoginFormState {
  phone: string;
  account_id: string;
  code: string;
}

interface DiscoveryFormState {
  shop_id: string;
  account_id: string;
  goal: string;
  entrypoint_url: string;
  namespace_hint: string;
  key_hint: string;
  max_steps: string;
}

interface RecipeFormState {
  recipe_id: string;
  expected_version: string;
}

interface ResultsFilterState {
  namespace: string;
  resource_key: string;
  date_from: string;
  date_to: string;
  page: string;
  size: string;
}

function eventVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (['failed', 'cancelled'].includes(status)) return 'destructive';
  if (['succeeded', 'success', 'finished', 'stable'].includes(status)) return 'secondary';
  if (['running', 'submitted'].includes(status)) return 'default';
  return 'outline';
}

function toPositiveInt(value: string, fallback: number): number {
  const normalized = Number(value.trim());
  if (!Number.isInteger(normalized) || normalized <= 0) {
    return fallback;
  }
  return normalized;
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function EventList({ events }: { events: AgentEvent[] }) {
  return (
    <div className="max-h-[300px] overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">序号</TableHead>
            <TableHead className="w-[140px]">状态</TableHead>
            <TableHead className="w-[180px]">事件</TableHead>
            <TableHead>消息</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                暂无事件
              </TableCell>
            </TableRow>
          ) : events.map(event => (
            <TableRow key={`${event.run_id}-${event.sequence}`}>
              <TableCell className="font-mono text-xs">{event.sequence}</TableCell>
              <TableCell>
                <Badge variant={eventVariant(String(event.status))}>{event.status}</Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">{event.event_type}</TableCell>
              <TableCell className="max-w-[420px] truncate text-xs">{event.message || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AgentWorkbenchPage() {
  const loginWsRef = useRef<WebSocket | null>(null);
  const discoveryWsRef = useRef<WebSocket | null>(null);
  const [loginForm, setLoginForm] = useState<LoginFormState>({ phone: '', account_id: '', code: '' });
  const [loginSessionId, setLoginSessionId] = useState('');
  const [loginEvents, setLoginEvents] = useState<AgentEvent[]>([]);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [discoveryForm, setDiscoveryForm] = useState<DiscoveryFormState>({
    shop_id: '',
    account_id: '',
    goal: DEFAULT_GOAL,
    entrypoint_url: DEFAULT_ENTRYPOINT,
    namespace_hint: DEFAULT_NAMESPACE,
    key_hint: DEFAULT_RECIPE_KEY,
    max_steps: '30',
  });
  const [discoveryRunId, setDiscoveryRunId] = useState('');
  const [discoveryEvents, setDiscoveryEvents] = useState<AgentEvent[]>([]);
  const [isDiscoverySubmitting, setIsDiscoverySubmitting] = useState(false);
  const [recipeForm, setRecipeForm] = useState<RecipeFormState>({ recipe_id: '', expected_version: '1' });
  const [recipeExport, setRecipeExport] = useState('');
  const [isRecipeSubmitting, setIsRecipeSubmitting] = useState(false);
  const [resultsFilter, setResultsFilter] = useState<ResultsFilterState>({
    namespace: DEFAULT_NAMESPACE,
    resource_key: '',
    date_from: '',
    date_to: '',
    page: '1',
    size: '50',
  });
  const [results, setResults] = useState<AgentResultItem[]>([]);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [selectedResult, setSelectedResult] = useState<AgentResultItem | null>(null);
  const [isResultsLoading, setIsResultsLoading] = useState(false);

  useEffect(() => () => {
    loginWsRef.current?.close();
    discoveryWsRef.current?.close();
  }, []);

  const resultsParams = useMemo<AgentResultsParams>(() => ({
    namespace: optionalText(resultsFilter.namespace),
    resource_key: optionalText(resultsFilter.resource_key),
    date_from: optionalText(resultsFilter.date_from),
    date_to: optionalText(resultsFilter.date_to),
    page: toPositiveInt(resultsFilter.page, 1),
    size: Math.min(toPositiveInt(resultsFilter.size, 50), 200),
  }), [resultsFilter]);

  const connectLoginEvents = useCallback((sessionId: string) => {
    loginWsRef.current?.close();
    setLoginEvents([]);
    loginWsRef.current = agentApi.connectEvents(
      agentApi.loginEventsUrl(sessionId),
      event => setLoginEvents(prev => [...prev, event]),
    );
  }, []);

  const connectDiscoveryEvents = useCallback((runId: string) => {
    discoveryWsRef.current?.close();
    setDiscoveryEvents([]);
    discoveryWsRef.current = agentApi.connectEvents(
      agentApi.discoveryEventsUrl(runId),
      event => setDiscoveryEvents(prev => [...prev, event]),
    );
  }, []);

  const startLogin = useCallback(async () => {
    const phone = loginForm.phone.trim();
    const accountId = loginForm.account_id.trim();
    if (!phone || !accountId) {
      toast.error('请输入手机号和账号ID');
      return;
    }
    setIsLoginSubmitting(true);
    try {
      const response = await agentApi.startLogin({ phone, account_id: accountId });
      setLoginSessionId(response.session_id);
      connectLoginEvents(response.session_id);
      toast.success(`登录会话已创建: ${response.session_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '登录会话创建失败');
    } finally {
      setIsLoginSubmitting(false);
    }
  }, [connectLoginEvents, loginForm.account_id, loginForm.phone]);

  const submitLoginCode = useCallback(async () => {
    if (!loginSessionId) {
      toast.error('请先创建登录会话');
      return;
    }
    const code = loginForm.code.trim();
    if (!/^\d{4,6}$/.test(code)) {
      toast.error('验证码必须为 4-6 位数字');
      return;
    }
    try {
      await agentApi.submitLoginCode(loginSessionId, { code });
      toast.success('验证码已提交');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '验证码提交失败');
    }
  }, [loginForm.code, loginSessionId]);

  const cancelLogin = useCallback(async () => {
    if (!loginSessionId) return;
    try {
      await agentApi.cancelLogin(loginSessionId);
      loginWsRef.current?.close();
      toast.success('登录会话已取消');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '取消登录失败');
    }
  }, [loginSessionId]);

  const startDiscovery = useCallback(async () => {
    const payload = {
      shop_id: discoveryForm.shop_id.trim(),
      account_id: optionalText(discoveryForm.account_id),
      goal: discoveryForm.goal.trim(),
      entrypoint_url: discoveryForm.entrypoint_url.trim(),
      namespace_hint: optionalText(discoveryForm.namespace_hint),
      key_hint: optionalText(discoveryForm.key_hint),
      max_steps: toPositiveInt(discoveryForm.max_steps, 30),
    };
    if (!payload.shop_id || !payload.goal || !payload.entrypoint_url) {
      toast.error('请输入店铺ID、目标和入口URL');
      return;
    }
    setIsDiscoverySubmitting(true);
    try {
      const response = await agentApi.startDiscovery(payload);
      setDiscoveryRunId(response.run_id);
      connectDiscoveryEvents(response.run_id);
      toast.success(`Discovery 已创建: ${response.run_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Discovery 创建失败');
    } finally {
      setIsDiscoverySubmitting(false);
    }
  }, [connectDiscoveryEvents, discoveryForm]);

  const markStable = useCallback(async () => {
    const recipeId = recipeForm.recipe_id.trim();
    const expectedVersion = toPositiveInt(recipeForm.expected_version, 1);
    if (!recipeId) {
      toast.error('请输入 recipe_id');
      return;
    }
    setIsRecipeSubmitting(true);
    try {
      await agentApi.markRecipeStable(recipeId, { expected_version: expectedVersion });
      toast.success('Recipe 已标记为 stable');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '标记 stable 失败');
    } finally {
      setIsRecipeSubmitting(false);
    }
  }, [recipeForm.expected_version, recipeForm.recipe_id]);

  const exportRecipe = useCallback(async () => {
    const recipeId = recipeForm.recipe_id.trim();
    if (!recipeId) {
      toast.error('请输入 recipe_id');
      return;
    }
    setIsRecipeSubmitting(true);
    try {
      const payload = await agentApi.exportRecipe(recipeId);
      setRecipeExport(formatJson(payload));
      toast.success('Recipe 已导出');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '导出 recipe 失败');
    } finally {
      setIsRecipeSubmitting(false);
    }
  }, [recipeForm.recipe_id]);

  const importRecipe = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setIsRecipeSubmitting(true);
    try {
      const response = await agentApi.importRecipe(file);
      setRecipeForm(prev => ({
        ...prev,
        recipe_id: String(response.id),
        expected_version: String(response.version),
      }));
      toast.success(`Recipe 已导入: ${response.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '导入 recipe 失败');
    } finally {
      setIsRecipeSubmitting(false);
    }
  }, []);

  const fetchResults = useCallback(async () => {
    setIsResultsLoading(true);
    try {
      const response = await agentApi.listResults(resultsParams);
      setResults(response.items);
      setResultsTotal(response.total);
    } catch (error) {
      setResults([]);
      setResultsTotal(0);
      toast.error(error instanceof Error ? error.message : 'Agent 结果加载失败');
    } finally {
      setIsResultsLoading(false);
    }
  }, [resultsParams]);

  const openResult = useCallback(async (resultId: number) => {
    try {
      setSelectedResult(await agentApi.getResult(resultId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Agent 结果详情加载失败');
    }
  }, []);

  const downloadResults = useCallback(() => {
    const namespace = resultsFilter.namespace.trim();
    const resourceKey = resultsFilter.resource_key.trim();
    const dateFrom = resultsFilter.date_from.trim();
    const dateTo = resultsFilter.date_to.trim();
    if (!namespace || !resourceKey || !dateFrom || !dateTo) {
      toast.error('下载 CSV 需要 namespace、resource_key、date_from、date_to');
      return;
    }
    window.open(agentApi.downloadResultsUrl({
      namespace,
      resource_key: resourceKey,
      date_from: dateFrom,
      date_to: dateTo,
    }), '_blank');
  }, [resultsFilter]);

  return (
    <SecondaryPageLayout
      breadcrumbs={[{ label: 'Agent 工作台' }]}
      title="Agent 工作台"
    >
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Agent 登录</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input placeholder="手机号" value={loginForm.phone} onChange={event => setLoginForm(prev => ({ ...prev, phone: event.target.value }))} />
              <Input placeholder="账号ID" value={loginForm.account_id} onChange={event => setLoginForm(prev => ({ ...prev, account_id: event.target.value }))} />
              <Button onClick={() => void startLogin()} disabled={isLoginSubmitting}>
                <Play className="mr-2 h-4 w-4" />
                发起登录
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <Input placeholder="短信验证码" value={loginForm.code} onChange={event => setLoginForm(prev => ({ ...prev, code: event.target.value }))} />
              <Button variant="outline" onClick={() => void submitLoginCode()} disabled={!loginSessionId}>
                提交验证码
              </Button>
              <Button variant="outline" onClick={() => void cancelLogin()} disabled={!loginSessionId}>
                <XCircle className="mr-2 h-4 w-4" />
                取消
              </Button>
            </div>
            {loginSessionId && <div className="font-mono text-xs text-muted-foreground">session_id: {loginSessionId}</div>}
            <EventList events={loginEvents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Discovery</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input placeholder="店铺ID" value={discoveryForm.shop_id} onChange={event => setDiscoveryForm(prev => ({ ...prev, shop_id: event.target.value }))} />
              <Input placeholder="账号ID" value={discoveryForm.account_id} onChange={event => setDiscoveryForm(prev => ({ ...prev, account_id: event.target.value }))} />
              <Input placeholder="max_steps" value={discoveryForm.max_steps} onChange={event => setDiscoveryForm(prev => ({ ...prev, max_steps: event.target.value }))} />
            </div>
            <Input placeholder="目标" value={discoveryForm.goal} onChange={event => setDiscoveryForm(prev => ({ ...prev, goal: event.target.value }))} />
            <Input placeholder="入口URL" value={discoveryForm.entrypoint_url} onChange={event => setDiscoveryForm(prev => ({ ...prev, entrypoint_url: event.target.value }))} />
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input placeholder="namespace_hint" value={discoveryForm.namespace_hint} onChange={event => setDiscoveryForm(prev => ({ ...prev, namespace_hint: event.target.value }))} />
              <Input placeholder="key_hint" value={discoveryForm.key_hint} onChange={event => setDiscoveryForm(prev => ({ ...prev, key_hint: event.target.value }))} />
              <Button onClick={() => void startDiscovery()} disabled={isDiscoverySubmitting}>
                <Play className="mr-2 h-4 w-4" />
                发起 Discovery
              </Button>
            </div>
            {discoveryRunId && <div className="font-mono text-xs text-muted-foreground">run_id: {discoveryRunId}</div>}
            <EventList events={discoveryEvents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipe</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_auto_auto_auto]">
              <Input placeholder="recipe_id" value={recipeForm.recipe_id} onChange={event => setRecipeForm(prev => ({ ...prev, recipe_id: event.target.value }))} />
              <Input placeholder="expected_version" value={recipeForm.expected_version} onChange={event => setRecipeForm(prev => ({ ...prev, expected_version: event.target.value }))} />
              <Button variant="outline" onClick={() => void markStable()} disabled={isRecipeSubmitting}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Stable
              </Button>
              <Button variant="outline" onClick={() => void exportRecipe()} disabled={isRecipeSubmitting}>
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
              <Button variant="outline" asChild disabled={isRecipeSubmitting}>
                <label>
                  <FileUp className="mr-2 h-4 w-4" />
                  导入
                  <input type="file" accept=".agent-recipe.json" className="hidden" onChange={event => void importRecipe(event)} />
                </label>
              </Button>
            </div>
            <Textarea value={recipeExport} onChange={event => setRecipeExport(event.target.value)} rows={8} className="font-mono text-xs" placeholder="导出 JSON" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Agent Results</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => void fetchResults()} disabled={isResultsLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isResultsLoading ? 'animate-spin' : ''}`} />
                查询
              </Button>
              <Button variant="outline" size="sm" onClick={downloadResults}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              <Input placeholder="namespace" value={resultsFilter.namespace} onChange={event => setResultsFilter(prev => ({ ...prev, namespace: event.target.value }))} />
              <Input placeholder="resource_key" value={resultsFilter.resource_key} onChange={event => setResultsFilter(prev => ({ ...prev, resource_key: event.target.value }))} />
              <Input type="date" value={resultsFilter.date_from} onChange={event => setResultsFilter(prev => ({ ...prev, date_from: event.target.value }))} />
              <Input type="date" value={resultsFilter.date_to} onChange={event => setResultsFilter(prev => ({ ...prev, date_to: event.target.value }))} />
              <Input placeholder="page" value={resultsFilter.page} onChange={event => setResultsFilter(prev => ({ ...prev, page: event.target.value }))} />
              <Input placeholder="size" value={resultsFilter.size} onChange={event => setResultsFilter(prev => ({ ...prev, size: event.target.value }))} />
            </div>

            <div className="overflow-auto rounded-md border">
              <Table className="min-w-[1040px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Namespace</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Recipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        {isResultsLoading ? '加载中...' : `暂无结果，共 ${resultsTotal} 条`}
                      </TableCell>
                    </TableRow>
                  ) : results.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id}</TableCell>
                      <TableCell className="font-mono text-xs">{item.namespace}</TableCell>
                      <TableCell className="font-mono text-xs">{item.resource_key}</TableCell>
                      <TableCell>{item.resource_date}</TableCell>
                      <TableCell className="font-mono text-xs">{item.recipe_id}</TableCell>
                      <TableCell><Badge variant={eventVariant(String(item.status))}>{item.status}</Badge></TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-red-500">{item.error_message || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => void openResult(item.id)}>
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {selectedResult && (
              <Textarea
                value={formatJson(selectedResult)}
                readOnly
                rows={12}
                className="font-mono text-xs"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </SecondaryPageLayout>
  );
}
