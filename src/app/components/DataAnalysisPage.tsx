'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lightbulb, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';
import { EndpointStatusWrapper } from '@/app/components/ui/endpoint-status-wrapper';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/app/components/ui/table';
import { analyticsApi } from '@/features/analytics/services/analyticsApi';
import { API_ENDPOINTS } from '@/config/api';

interface AnalysisItem {
  id: number | string;
  name: string;
  type: string;
  status: string;
  result_summary: string;
  created_at: string;
  completed_at?: string | null;
}

interface RecentInsight {
  title: string;
  description: string;
  impact: string;
  confidence: number;
}

interface AnalysisOverviewData {
  analyses?: AnalysisItem[];
  recent_insights?: RecentInsight[];
  total?: number;
}

export default function DataAnalysisPage() {
  const query = useQuery({
    queryKey: ['analysis', 'overview'],
    queryFn: () => analyticsApi.getOverview(),
  });

  const apiData = query.data?.data?.data as AnalysisOverviewData | undefined;
  const analyses = apiData?.analyses || [];
  const recentInsights = apiData?.recent_insights || [];

  return (
    <EndpointStatusWrapper
      path={API_ENDPOINTS.ANALYSIS_OVERVIEW}
      responseData={query.data}
      placeholderProps={{ icon: <FileText size={48} className="text-cyan-500" /> }}
    >
      <div className="min-h-screen bg-transparent text-foreground p-6 space-y-6 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="fixed top-20 right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Recent Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 col-span-full">
            <NeonTitle icon={Lightbulb}>最新洞察 (Recent Insights)</NeonTitle>
            <div className="grid gap-4 mt-4">
              {recentInsights.length > 0 ? (
                recentInsights.map((insight, index: number) => (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-lg ${insight.impact === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                      <Lightbulb size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-200">{insight.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{insight.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs font-mono text-slate-500">
                        <span className="flex items-center gap-1">
                          IMPACT: <span className={insight.impact === 'high' ? 'text-rose-400' : 'text-cyan-400'}>{insight.impact.toUpperCase()}</span>
                        </span>
                        <span>CONFIDENCE: {(insight.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">暂无洞察数据</div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Analysis Reports Table */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <NeonTitle icon={FileText}>分析报告 (Analysis Reports)</NeonTitle>
            <div className="text-xs font-mono text-slate-500">
              Total: {apiData?.total || 0}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>分析名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>结果摘要</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>完成时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-white/5">
                    <TableCell className="font-mono text-slate-500">#{item.id}</TableCell>
                    <TableCell className="font-medium text-slate-200">{item.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700">
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${
                        item.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {item.status === 'completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 max-w-xs truncate" title={item.result_summary}>
                      {item.result_summary}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {item.completed_at ? new Date(item.completed_at).toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {analyses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                      暂无分析记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCard>
      </div>
    </EndpointStatusWrapper>
  );
}
