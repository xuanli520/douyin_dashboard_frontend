'use client';

import { ChangeEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, FileUp, Play, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { SecondaryPageLayout } from '@/app/components/layout/SecondaryPageLayout';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { dataSourceApi } from '@/features/data-source/services/dataSourceApi';
import { agentApi } from '@/features/agent/services/agentApi';
import { AgentEvent, AgentRecipeListItem, AgentResultItem, AgentResultsParams } from '@/features/agent/services/types';
import { DataSourceResponse, ScrapingRuleListItem } from '@/types';

const DEFAULT_GOAL = '发现抖店体验分单页采集路径';
const DEFAULT_ENTRYPOINT = 'https://fxg.jinritemai.com/tps/score/home';
const DEFAULT_NAMESPACE = 'douyin_shop_dashboard';
const DEFAULT_RECIPE_KEY = 'experience_score_single_page';

interface LoginFormState {
  phone: string;
  code: string;
}

interface DiscoveryFormState {
  goal: string;
  entrypoint_url: string;
  namespace_hint: string;
  key_hint: string;
  max_steps: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readText(source: Record<string, unknown> | undefined, key: string): string {
  const value = source?.[key];
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function textItems(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return [String(value)];
  }
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return [];
    if (text.startsWith('[')) {
      try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? textItems(parsed) : [];
      } catch {
        return [];
      }
    }
    return text.split(/[;,|]/).map(item => item.trim()).filter(Boolean);
  }
  return [];
}

function uniqueItems(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function sourceConfig(source: DataSourceResponse | null): Record<string, unknown> {
  return isRecord(source?.config) ? source.config : {};
}

function ruleConfig(rule: ScrapingRuleListItem | null): Record<string, unknown> {
  return isRecord(rule?.config) ? rule.config : {};
}

function ruleFilters(rule: ScrapingRuleListItem | null): Record<string, unknown> {
  const filters = ruleConfig(rule).filters;
  return isRecord(filters) ? filters : {};
}

function resolveShopIds(source: DataSourceResponse | null, rule: ScrapingRuleListItem | null): string[] {
  const dsConfig = sourceConfig(source);
  const config = ruleConfig(rule);
  const filters = ruleFilters(rule);
  const allMode = filters.all === true || config.all === true;
  return uniqueItems([
    ...(allMode ? ['all'] : []),
    ...textItems(config.resolved_shop_ids),
    ...textItems(config.shop_ids),
    ...textItems(config.shop_id),
    ...textItems(filters.shop_ids),
    ...textItems(filters.shop_id),
    ...textItems(dsConfig.shop_ids),
    ...textItems(dsConfig.shop_id),
  ]);
}

function resolveAccountId(source: DataSourceResponse | null, rule: ScrapingRuleListItem | null): string {
  const dsConfig = sourceConfig(source);
  const meta = dsConfig.shop_dashboard_login_state_meta;
  const metaRecord = isRecord(meta) ? meta : undefined;
  return (
    readText(dsConfig, 'account_id') ||
    readText(metaRecord, 'account_id') ||
    readText(dsConfig, 'user_phone') ||
    (source?.id ? `data_source_${source.id}` : '') ||
    (rule?.id ? `rule_${rule.id}` : '')
  );
}

function resolvePhone(source: DataSourceResponse | null): string {
  const config = sourceConfig(source);
  return readText(config, 'phone') || readText(config, 'user_phone');
}

function resolveRecipeRef(rule: ScrapingRuleListItem | null): { namespace: string; key: string; version?: number } | null {
  const ref = ruleConfig(rule).agent_recipe;
  if (!isRecord(ref)) return null;
  const namespace = readText(ref, 'namespace');
  const key = readText(ref, 'key');
  if (!namespace || !key) return null;
  const version = Number(ref.version);
  return Number.isInteger(version) && version > 0 ? { namespace, key, version } : { namespace, key };
}

function resolveEntrypoint(rule: ScrapingRuleListItem | null, selectedRecipe: AgentRecipeListItem | null): string {
  const config = ruleConfig(rule);
  const entrypoint = config.entrypoint_url || config.entrypoint;
  if (typeof entrypoint === 'string' && entrypoint.trim()) {
    return entrypoint.trim();
  }
  if (isRecord(entrypoint)) {
    const url = readText(entrypoint, 'url') || readText(entrypoint, 'url_template');
    if (url) return url;
  }
  if (selectedRecipe?.namespace === DEFAULT_NAMESPACE && selectedRecipe.key === DEFAULT_RECIPE_KEY) {
    return DEFAULT_ENTRYPOINT;
  }
  return DEFAULT_ENTRYPOINT;
}

function dataSourceLabel(source: DataSourceResponse): string {
  return `${source.name} #${source.id} · ${source.status}`;
}

function ruleLabel(rule: ScrapingRuleListItem): string {
  return `${rule.name} #${rule.id}`;
}

function recipeLabel(recipe: AgentRecipeListItem): string {
  return `${recipe.namespace}/${recipe.key} v${recipe.version} #${recipe.id}`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
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
  const [dataSources, setDataSources] = useState<DataSourceResponse[]>([]);
  const [rules, setRules] = useState<ScrapingRuleListItem[]>([]);
  const [recipes, setRecipes] = useState<AgentRecipeListItem[]>([]);
  const [selectedDataSourceId, setSelectedDataSourceId] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isRulesLoading, setIsRulesLoading] = useState(false);
  const [rulesLoadFailed, setRulesLoadFailed] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginFormState>({ phone: '', code: '' });
  const [loginSessionId, setLoginSessionId] = useState('');
  const [loginEvents, setLoginEvents] = useState<AgentEvent[]>([]);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [discoveryForm, setDiscoveryForm] = useState<DiscoveryFormState>({
    goal: DEFAULT_GOAL,
    entrypoint_url: DEFAULT_ENTRYPOINT,
    namespace_hint: DEFAULT_NAMESPACE,
    key_hint: DEFAULT_RECIPE_KEY,
    max_steps: '30',
  });
  const [discoveryRunId, setDiscoveryRunId] = useState('');
  const [discoveryEvents, setDiscoveryEvents] = useState<AgentEvent[]>([]);
  const [isDiscoverySubmitting, setIsDiscoverySubmitting] = useState(false);
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

  const selectedDataSource = useMemo(
    () => dataSources.find(item => String(item.id) === selectedDataSourceId) || null,
    [dataSources, selectedDataSourceId],
  );

  const selectedRule = useMemo(
    () => rules.find(item => String(item.id) === selectedRuleId) || null,
    [rules, selectedRuleId],
  );

  const selectedRecipe = useMemo(
    () => recipes.find(item => String(item.id) === selectedRecipeId) || null,
    [recipes, selectedRecipeId],
  );

  const availableShopIds = useMemo(
    () => resolveShopIds(selectedDataSource, selectedRule),
    [selectedDataSource, selectedRule],
  );

  const selectedAccountId = useMemo(
    () => resolveAccountId(selectedDataSource, selectedRule),
    [selectedDataSource, selectedRule],
  );

  const selectedRecipeRef = useMemo(
    () => resolveRecipeRef(selectedRule),
    [selectedRule],
  );

  useEffect(() => {
    let ignore = false;
    async function loadOptions() {
      setIsOptionsLoading(true);
      try {
        const [sourceResult, recipeResult] = await Promise.allSettled([
          dataSourceApi.getAll({ source_type: 'DOUYIN_SHOP', page: 1, size: 100 }),
          agentApi.listRecipes(),
        ]);
        if (ignore) return;
        if (sourceResult.status === 'fulfilled') {
          setDataSources(sourceResult.value.items);
          setSelectedDataSourceId(prev => prev || (sourceResult.value.items[0] ? String(sourceResult.value.items[0].id) : ''));
        } else {
          setDataSources([]);
          toast.error(sourceResult.reason instanceof Error ? sourceResult.reason.message : '数据源加载失败');
        }
        if (recipeResult.status === 'fulfilled') {
          setRecipes(recipeResult.value.items);
        } else {
          setRecipes([]);
          toast.error(recipeResult.reason instanceof Error ? recipeResult.reason.message : 'Recipe 加载失败');
        }
      } finally {
        if (!ignore) setIsOptionsLoading(false);
      }
    }
    void loadOptions();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadRules() {
      if (!selectedDataSource) {
        setRules([]);
        setSelectedRuleId('');
        return;
      }
      setIsRulesLoading(true);
      setRulesLoadFailed(false);
      try {
        const nextRules = await dataSourceApi.getScrapingRules(selectedDataSource.id);
        if (ignore) return;
        setRules(nextRules);
        setSelectedRuleId(prev => (
          nextRules.some(item => String(item.id) === prev)
            ? prev
            : (nextRules[0] ? String(nextRules[0].id) : '')
        ));
      } catch (error) {
        if (!ignore) {
          setRules([]);
          setSelectedRuleId('');
          setRulesLoadFailed(true);
          toast.error(error instanceof Error ? error.message : '关联规则加载失败');
        }
      } finally {
        if (!ignore) setIsRulesLoading(false);
      }
    }
    void loadRules();
    return () => {
      ignore = true;
    };
  }, [selectedDataSource]);

  useEffect(() => {
    setSelectedShopId(prev => (
      availableShopIds.includes(prev) ? prev : (availableShopIds[0] || '')
    ));
  }, [availableShopIds]);

  useEffect(() => {
    const phone = resolvePhone(selectedDataSource);
    if (phone) {
      setLoginForm(prev => ({ ...prev, phone }));
    }
  }, [selectedDataSource]);

  useEffect(() => {
    const matchedRecipe = selectedRecipeRef
      ? recipes.find(item => (
        item.namespace === selectedRecipeRef.namespace &&
        item.key === selectedRecipeRef.key &&
        (!selectedRecipeRef.version || item.version === selectedRecipeRef.version)
      ))
      : null;
    const fallbackRecipe = recipes.find(item => item.namespace === DEFAULT_NAMESPACE && item.key === DEFAULT_RECIPE_KEY) || recipes[0];
    setSelectedRecipeId(prev => {
      if (matchedRecipe) return String(matchedRecipe.id);
      if (recipes.some(item => String(item.id) === prev)) return prev;
      return fallbackRecipe ? String(fallbackRecipe.id) : '';
    });
  }, [recipes, selectedRecipeRef]);

  useEffect(() => {
    const recipeRef = selectedRecipe
      ? { namespace: selectedRecipe.namespace, key: selectedRecipe.key }
      : selectedRecipeRef;
    setDiscoveryForm(prev => ({
      ...prev,
      entrypoint_url: resolveEntrypoint(selectedRule, selectedRecipe),
      namespace_hint: recipeRef?.namespace || DEFAULT_NAMESPACE,
      key_hint: recipeRef?.key || DEFAULT_RECIPE_KEY,
    }));
    setResultsFilter(prev => ({
      ...prev,
      namespace: recipeRef?.namespace || DEFAULT_NAMESPACE,
      resource_key: selectedShopId,
    }));
  }, [selectedRecipe, selectedRecipeRef, selectedRule, selectedShopId]);

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
    const accountId = selectedAccountId;
    if (!phone || !accountId || !selectedDataSource) {
      toast.error('请选择数据源并填写手机号');
      return;
    }
    setIsLoginSubmitting(true);
    try {
      const response = await agentApi.startLogin({
        phone,
        account_id: accountId,
        data_source_id: selectedDataSource.id,
      });
      setLoginSessionId(response.session_id);
      connectLoginEvents(response.session_id);
      toast.success(`登录会话已创建: ${response.session_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '登录会话创建失败');
    } finally {
      setIsLoginSubmitting(false);
    }
  }, [connectLoginEvents, loginForm.phone, selectedAccountId, selectedDataSource]);

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
      shop_id: selectedShopId,
      account_id: optionalText(selectedAccountId),
      goal: discoveryForm.goal.trim(),
      entrypoint_url: discoveryForm.entrypoint_url.trim(),
      namespace_hint: optionalText(discoveryForm.namespace_hint),
      key_hint: optionalText(discoveryForm.key_hint),
      max_steps: toPositiveInt(discoveryForm.max_steps, 30),
    };
    if (!payload.shop_id || !payload.goal || !payload.entrypoint_url) {
      toast.error('请选择数据源、采集规则和店铺范围');
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
  }, [connectDiscoveryEvents, discoveryForm, selectedAccountId, selectedShopId]);

  const markStable = useCallback(async () => {
    if (!selectedRecipe) {
      toast.error('请选择 Recipe');
      return;
    }
    setIsRecipeSubmitting(true);
    try {
      await agentApi.markRecipeStable(selectedRecipe.id, { expected_version: selectedRecipe.version });
      toast.success('Recipe 已标记为 stable');
      const response = await agentApi.listRecipes();
      setRecipes(response.items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '标记 stable 失败');
    } finally {
      setIsRecipeSubmitting(false);
    }
  }, [selectedRecipe]);

  const exportRecipe = useCallback(async () => {
    if (!selectedRecipe) {
      toast.error('请选择 Recipe');
      return;
    }
    setIsRecipeSubmitting(true);
    try {
      const payload = await agentApi.exportRecipe(selectedRecipe.id);
      setRecipeExport(formatJson(payload));
      toast.success('Recipe 已导出');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '导出 recipe 失败');
    } finally {
      setIsRecipeSubmitting(false);
    }
  }, [selectedRecipe]);

  const importRecipe = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setIsRecipeSubmitting(true);
    try {
      const response = await agentApi.importRecipe(file);
      const recipesResponse = await agentApi.listRecipes();
      setRecipes(recipesResponse.items);
      setSelectedRecipeId(String(response.id));
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
      breadcrumbs={[]}
      title="Agent 工作台"
    >
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Agent 登录</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_auto]">
              <Field label="数据源">
                <Select
                  value={selectedDataSourceId || undefined}
                  onValueChange={value => {
                    setSelectedDataSourceId(value);
                    setSelectedRuleId('');
                    setSelectedShopId('');
                  }}
                  disabled={isOptionsLoading || dataSources.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isOptionsLoading ? '加载数据源中...' : '选择数据源'} />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.length === 0 ? (
                      <SelectItem value="empty-data-sources" disabled>
                        {isOptionsLoading ? '加载数据源中...' : '暂无可用数据源'}
                      </SelectItem>
                    ) : dataSources.map(source => (
                      <SelectItem key={source.id} value={String(source.id)}>
                        {dataSourceLabel(source)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="手机号">
                <Input placeholder="手机号" value={loginForm.phone} onChange={event => setLoginForm(prev => ({ ...prev, phone: event.target.value }))} />
              </Field>
              <Field label="账号 ID">
                <Input placeholder="账号 ID" value={selectedAccountId} readOnly />
              </Field>
              <div className="flex items-end">
                <Button onClick={() => void startLogin()} disabled={isLoginSubmitting || !selectedAccountId}>
                  <Play className="mr-2 h-4 w-4" />
                  发起登录
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <Field label="短信验证码">
                <Input placeholder="短信验证码" value={loginForm.code} onChange={event => setLoginForm(prev => ({ ...prev, code: event.target.value }))} />
              </Field>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => void submitLoginCode()} disabled={!loginSessionId}>
                  提交验证码
                </Button>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => void cancelLogin()} disabled={!loginSessionId}>
                  <XCircle className="mr-2 h-4 w-4" />
                  取消
                </Button>
              </div>
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
            <div className="grid gap-3 md:grid-cols-[1.3fr_1.3fr_1fr]">
              <Field label="数据源">
                <Select
                  value={selectedDataSourceId || undefined}
                  onValueChange={value => {
                    setSelectedDataSourceId(value);
                    setSelectedRuleId('');
                    setSelectedShopId('');
                  }}
                  disabled={isOptionsLoading || dataSources.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isOptionsLoading ? '加载数据源中...' : '选择数据源'} />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.length === 0 ? (
                      <SelectItem value="empty-discovery-data-sources" disabled>
                        {isOptionsLoading ? '加载数据源中...' : '暂无可用数据源'}
                      </SelectItem>
                    ) : dataSources.map(source => (
                      <SelectItem key={source.id} value={String(source.id)}>
                        {dataSourceLabel(source)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="采集规则">
                <Select
                  value={selectedRuleId || undefined}
                  onValueChange={value => {
                    setSelectedRuleId(value);
                    setSelectedShopId('');
                  }}
                  disabled={!selectedDataSourceId || isRulesLoading || rules.length === 0}
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
                      <SelectItem value="rule-need-data-source" disabled>请先选择数据源</SelectItem>
                    )}
                    {selectedDataSourceId && isRulesLoading && (
                      <SelectItem value="rule-loading" disabled>加载规则中...</SelectItem>
                    )}
                    {selectedDataSourceId && !isRulesLoading && rules.length === 0 && (
                      <SelectItem value="empty-rules" disabled>
                        {rulesLoadFailed ? '规则加载失败，请切换数据源重试' : '该数据源下暂无规则'}
                      </SelectItem>
                    )}
                    {selectedDataSourceId && !isRulesLoading && rules.map(rule => (
                      <SelectItem key={rule.id} value={String(rule.id)}>
                        {ruleLabel(rule)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="最大步骤">
                <Input placeholder="30" value={discoveryForm.max_steps} onChange={event => setDiscoveryForm(prev => ({ ...prev, max_steps: event.target.value }))} />
              </Field>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
              <Field label="店铺范围">
                <Select
                  value={selectedShopId || undefined}
                  onValueChange={setSelectedShopId}
                  disabled={availableShopIds.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择店铺范围" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableShopIds.length === 0 ? (
                      <SelectItem value="empty-shop-ids" disabled>当前规则未配置店铺范围</SelectItem>
                    ) : availableShopIds.map(shopId => (
                      <SelectItem key={shopId} value={shopId}>
                        {shopId === 'all' ? '全部店铺' : shopId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="账号 ID">
                <Input placeholder="账号 ID" value={selectedAccountId} readOnly />
              </Field>
            </div>
            <Field label="目标">
              <Input placeholder="目标" value={discoveryForm.goal} onChange={event => setDiscoveryForm(prev => ({ ...prev, goal: event.target.value }))} />
            </Field>
            <Field label="入口 URL">
              <Input placeholder="入口 URL" value={discoveryForm.entrypoint_url} onChange={event => setDiscoveryForm(prev => ({ ...prev, entrypoint_url: event.target.value }))} />
            </Field>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Field label="Namespace">
                <Input placeholder="namespace_hint" value={discoveryForm.namespace_hint} onChange={event => setDiscoveryForm(prev => ({ ...prev, namespace_hint: event.target.value }))} />
              </Field>
              <Field label="Key">
                <Input placeholder="key_hint" value={discoveryForm.key_hint} onChange={event => setDiscoveryForm(prev => ({ ...prev, key_hint: event.target.value }))} />
              </Field>
              <div className="flex items-end">
                <Button onClick={() => void startDiscovery()} disabled={isDiscoverySubmitting || !selectedShopId}>
                  <Play className="mr-2 h-4 w-4" />
                  发起 Discovery
                </Button>
              </div>
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
            <div className="grid gap-3 md:grid-cols-[1fr_140px_auto_auto_auto]">
              <Field label="Recipe">
                <Select
                  value={selectedRecipeId || undefined}
                  onValueChange={setSelectedRecipeId}
                  disabled={isOptionsLoading || recipes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isOptionsLoading ? '加载 Recipe 中...' : '选择 Recipe'} />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.length === 0 ? (
                      <SelectItem value="empty-recipes" disabled>
                        {isOptionsLoading ? '加载 Recipe 中...' : '暂无 Recipe'}
                      </SelectItem>
                    ) : recipes.map(recipe => (
                      <SelectItem key={recipe.id} value={String(recipe.id)}>
                        {recipeLabel(recipe)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="版本">
                <Input placeholder="version" value={selectedRecipe ? String(selectedRecipe.version) : ''} readOnly />
              </Field>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => void markStable()} disabled={isRecipeSubmitting || !selectedRecipe}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Stable
                </Button>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => void exportRecipe()} disabled={isRecipeSubmitting || !selectedRecipe}>
                  <Download className="mr-2 h-4 w-4" />
                  导出
                </Button>
              </div>
              <div className="flex items-end">
                <Button variant="outline" asChild disabled={isRecipeSubmitting}>
                  <label aria-disabled={isRecipeSubmitting}>
                    <FileUp className="mr-2 h-4 w-4" />
                    导入
                    <input type="file" accept=".agent-recipe.json" className="hidden" disabled={isRecipeSubmitting} onChange={event => void importRecipe(event)} />
                  </label>
                </Button>
              </div>
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
