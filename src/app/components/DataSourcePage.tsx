'use client';

import { useState } from 'react';
import { Search, Database, RefreshCw, Server, Plus } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';

const dataSources = [
  {
    id: 1,
    name: '抖音广告API',
    type: 'API',
    frequency: '实时',
    lastUpdate: '2024-05-20 10:30',
    status: 'normal'
  },
  {
    id: 2,
    name: 'MySQL数据库',
    type: '数据库',
    frequency: '每日',
    lastUpdate: '2024-05-19 23:00',
    status: 'error'
  },
];

export default function DataSourcePage() {
  const [searchText, setSearchText] = useState('');

  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 space-y-6">
      
      <GlassCard className="min-h-[600px] flex flex-col">
        {/* Header & Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <NeonTitle icon={Database}>数据源管理</NeonTitle>
          
            <div className="flex items-center gap-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="搜索数据源..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="pl-10 pr-4 py-2 w-[240px] bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                    />
                </div>

                <select className="px-3 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-cyan-500/50">
                    <option>全部类型</option>
                    <option>API</option>
                    <option>数据库</option>
                </select>

                 <select className="px-3 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-cyan-500/50">
                    <option>全部状态</option>
                    <option>正常</option>
                    <option>异常</option>
                </select>

                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/30 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] text-sm font-medium group">
                    <Plus size={16} className="group-hover:rotate-90 transition-transform"/>
                    添加数据源
                </button>
            </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                {['数据源名称', '类型', '同步频率', '最后更新时间', '状态', '操作'].map((h) => (
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
                          <div className={`p-2 rounded-lg ${source.type === 'API' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                              {source.type === 'API' ? <Server size={18} /> : <Database size={18} />}
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{source.name}</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{source.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <RefreshCw size={12} className="text-slate-500" />
                        {source.frequency}
                      </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{source.lastUpdate}</td>
                  <td className="px-6 py-4">
                    {source.status === 'normal' ? (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        RUNNING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono rounded border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                        ERROR
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm font-mono">
                      <button className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 hover:underline decoration-cyan-500/50 underline-offset-4">配置</button>
                      <button className="text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 hover:underline decoration-rose-500/50 underline-offset-4">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <div className="flex gap-2">
                 <button className="px-3 py-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 disabled:opacity-50">Previous</button>
                 <button className="px-3 py-1 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30 border border-cyan-500/30 rounded">1</button>
                 <button className="px-3 py-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300">Next</button>
            </div>
        </div>
      </GlassCard>
    </div>
  );
}