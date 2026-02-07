'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Database, RefreshCw, Server, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';
import { DataSourceSelect } from '@/app/components/ui/styled-select';
import { Select, SelectItem } from '@/app/components/ui/select';
import { dataSourceApi } from '@/features/data-source/services/dataSourceApi';
import { DataSource, DataSourceFilter } from '@/features/data-source/services/types';
import { toast } from 'sonner';

export default function DataSourcePage() {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });

  const fetchDataSources = useCallback(async () => {
    try {
      setLoading(true);
      const params: DataSourceFilter = {
        name: searchText || undefined,
        type: filterType as 'all',
        status: filterStatus as 'all',
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      const response = await dataSourceApi.getAll(params);
      setDataSources(response.list);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      toast.error('获取数据源列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchText, filterType, filterStatus, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchDataSources();
  }, [fetchDataSources]);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该数据源吗？')) return;
    try {
      await dataSourceApi.delete(id);
      toast.success('删除成功');
      fetchDataSources();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'douyin_api' ? <Server size={18} /> : <Database size={18} />;
  };

  const getTypeColor = (type: string) => {
    return type === 'douyin_api' 
      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 space-y-6">
      <GlassCard className="min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NeonTitle icon={Database}>数据源管理</NeonTitle>
            <div className="flex items-center gap-2">
              <DataSourceSelect>
                <SelectItem value="all" onClick={() => setFilterType('all')}>全部类型</SelectItem>
                <SelectItem value="douyin_api" onClick={() => setFilterType('douyin_api')}>抖音API</SelectItem>
                <SelectItem value="database" onClick={() => setFilterType('database')}>数据库</SelectItem>
                <SelectItem value="file_upload" onClick={() => setFilterType('file_upload')}>文件上传</SelectItem>
                <SelectItem value="webhook" onClick={() => setFilterType('webhook')}>Webhook</SelectItem>
              </DataSourceSelect>

              <DataSourceSelect>
                <SelectItem value="all" onClick={() => setFilterStatus('all')}>全部状态</SelectItem>
                <SelectItem value="active" onClick={() => setFilterStatus('active')}>正常</SelectItem>
                <SelectItem value="inactive" onClick={() => setFilterStatus('inactive')}>停用</SelectItem>
                <SelectItem value="error" onClick={() => setFilterStatus('error')}>异常</SelectItem>
              </DataSourceSelect>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
              <input
                type="text"
                placeholder="搜索数据源..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="pl-10 pr-4 py-2 w-[240px] bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
              />
            </div>

            <button 
              onClick={fetchDataSources}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/30 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] text-sm font-medium group"
            >
              <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500"/>
              刷新
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/30 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] text-sm font-medium group">
              <Plus size={16} className="group-hover:rotate-90 transition-transform"/>
              添加数据源
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : dataSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Database size={48} className="mb-4 opacity-50" />
              <p>暂无数据源</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  {['数据源名称', '类型', '状态', '创建时间', '更新时间', '操作'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {dataSources.map((source) => (
                  <tr key={source.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(source.type)}`}>
                          {getTypeIcon(source.type)}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{source.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                      {source.type === 'douyin_api' ? '抖音API' : source.type === 'database' ? '数据库' : source.type === 'file_upload' ? '文件上传' : 'Webhook'}
                    </td>
                    <td className="px-6 py-4">
                      {source.status === 'active' ? (
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <CheckCircle size={12} />
                          正常
                        </span>
                      ) : source.status === 'error' ? (
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono rounded border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                          <AlertCircle size={12} />
                          异常
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs font-mono rounded border border-slate-500/20">
                          停用
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{source.created_at}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{source.updated_at}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm font-mono">
                        <button className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 hover:underline decoration-cyan-500/50 underline-offset-4">配置</button>
                        <button 
                          onClick={() => handleDelete(source.id)}
                          className="text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 hover:underline decoration-rose-500/50 underline-offset-4"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && dataSources.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              共 {pagination.total} 条
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-3 py-1 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30 border border-cyan-500/30 rounded">
                {pagination.page}
              </span>
              <button 
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page * pagination.pageSize >= pagination.total}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}