'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useThemeStore } from '@/stores/themeStore';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';

const trendData = [
  { time: '00:00', score: 89 },
  { time: '03:00', score: 92 },
  { time: '06:00', score: 91 },
  { time: '09:00', score: 95 },
  { time: '12:00', score: 96 },
  { time: '15:00', score: 94 },
  { time: '18:00', score: 96.8 },
  { time: '21:00', score: 95 },
  { time: '24:00', score: 93 },
];

const radarData = [
  { subject: '商品体验分', A: 97.2, fullMark: 100 },
  { subject: '物流体验分', A: 95.6, fullMark: 100 },
  { subject: '服务体验分', A: 96.4, fullMark: 100 },
  { subject: '差评风险', A: 20, fullMark: 100 },
];

const rankData = [
  { name: '旗舰店A', score: 98.6 },
  { name: '旗舰店B', score: 97.5 },
  { name: '旗舰店C', score: 97.2 },
  { name: '专营店D', score: 95.9 },
  { name: '专营店E', score: 95.3 },
  { name: '专营店F', score: 94.8 },
  { name: '专营店G', score: 93.7 },
  { name: '专营店H', score: 92.5 },
  { name: '专营店I', score: 91.6 },
  { name: '专营店J', score: 90.4 },
];

const pieDataScore = [
  { name: '优秀 (95分以上)', value: 48, count: 48, percent: '37.5%' },
  { name: '良好 (90~95分)', value: 38, count: 38, percent: '29.7%' },
  { name: '一般 (75~90分)', value: 20, count: 20, percent: '15.6%' },
  { name: '较差 (低于75分)', value: 14, count: 14, percent: '10.9%' },
  { name: '极差 (低于60分)', value: 8, count: 8, percent: '6.3%' },
];

const pieDataProblem = [
  { name: '商品质量问题', value: 102, count: 102, percent: '35.7%' },
  { name: '物流配送问题', value: 78, count: 78, percent: '27.3%' },
  { name: '服务态度问题', value: 58, count: 58, percent: '20.3%' },
  { name: '售后处理问题', value: 30, count: 30, percent: '10.5%' },
  { name: '其他问题', value: 18, count: 18, percent: '6.3%' },
];

const COLORS_SCORE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const COLORS_PROBLEM = ['#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'];
const COLORS_CYBER = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function CardHeader({
  title,
  description,
  rightContent,
}: {
  title: string;
  description: string;
  rightContent?: React.ReactNode;
}) {
  const { appTheme } = useThemeStore();
  const isEnterprise = appTheme === 'enterprise';
  const titleColor = isEnterprise
    ? 'text-[#1e3a5a] dark:text-slate-100'
    : 'text-slate-900 dark:text-slate-100';
  const iconColor = isEnterprise
    ? 'text-slate-400 dark:text-slate-500'
    : 'text-slate-500 dark:text-slate-400';

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1.5">
        <h3 className={`truncate font-bold ${titleColor}`}>{title}</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className={`h-3.5 w-3.5 flex-shrink-0 cursor-help ${iconColor}`} />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-64 leading-relaxed">
            {description}
          </TooltipContent>
        </Tooltip>
      </div>
      {rightContent && <div className="flex flex-shrink-0 items-center gap-2">{rightContent}</div>}
    </div>
  );
}

export function ChartsSection() {
  const { appTheme } = useThemeStore();
  const isEnterprise = appTheme === 'enterprise';

  const cardClass = isEnterprise
    ? 'bg-white dark:bg-[var(--card)] border-slate-100 dark:border-[var(--border)] shadow-sm dark:shadow-[0_20px_45px_-24px_rgba(0,0,0,0.85)]'
    : 'bg-white/90 dark:bg-[#0a101f]/80 border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none';
  const gridColor = isEnterprise ? 'var(--muted)' : 'rgba(148,163,184,0.22)';
  const axisColor = isEnterprise ? 'var(--muted-foreground)' : 'var(--cyber-text)';
  const primaryLineColor = isEnterprise ? 'var(--primary)' : '#0ea5e9';
  const tooltipStyle = {
    backgroundColor: 'var(--popover)',
    borderColor: 'var(--border)',
    color: 'var(--popover-foreground)',
    borderRadius: '8px',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
  };
  const legendTextClass = isEnterprise
    ? 'text-slate-600 dark:text-slate-300'
    : 'text-slate-700 dark:text-slate-300';
  const strongTextClass = isEnterprise
    ? 'text-slate-800 dark:text-slate-100'
    : 'text-slate-900 dark:text-white';
  const mutedTextClass = isEnterprise
    ? 'text-slate-500 dark:text-slate-400'
    : 'text-slate-500 dark:text-slate-400';
  const progressTrackClass = isEnterprise
    ? 'bg-slate-100 dark:bg-slate-800'
    : 'bg-slate-200 dark:bg-slate-800';

  return (
    <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:col-span-8 xl:h-[640px] xl:grid-rows-2">
        <div className={`flex min-h-[300px] flex-col rounded-xl border p-4 ${cardClass}`}>
          <CardHeader
            title="店铺平均分趋势图"
            description="展示所选时间范围内各店铺综合评分均值的变化趋势。"
            rightContent={
              !isEnterprise && (
                <div className="hidden gap-2 sm:flex">
                  <span className="rounded border border-[#0ea5e9]/30 bg-[#0ea5e9]/10 px-2 py-0.5 text-[10px] text-[#0284c7] dark:text-[#0ea5e9]">
                    近24小时
                  </span>
                  <span className="rounded border border-slate-300 px-2 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    近7天
                  </span>
                </div>
              )
            }
          />
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="time" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[70, 100]} stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickCount={7} />
                <RechartsTooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'var(--popover-foreground)' }}
                  itemStyle={{ color: primaryLineColor }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={primaryLineColor}
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--card)', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="店铺平均分"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`flex min-h-[300px] flex-col rounded-xl border p-4 ${cardClass}`}>
          <CardHeader
            title="四项评分雷达图"
            description="对比商品、物流、服务和差评行为维度的当前表现。"
          />
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor, fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="分数"
                  dataKey="A"
                  stroke={primaryLineColor}
                  fill={primaryLineColor}
                  fillOpacity={isEnterprise ? 0.14 : 0.3}
                />
                <RechartsTooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'var(--popover-foreground)' }}
                  itemStyle={{ color: primaryLineColor }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`flex min-h-[300px] flex-col rounded-xl border p-4 ${cardClass}`}>
          <CardHeader
            title="评分结构占比"
            description="按综合评分区间统计店铺数量和占比。"
          />
          <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(120px,0.9fr)_minmax(0,1.1fr)]">
            <div className="relative mx-auto h-full min-h-[160px] w-full max-w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataScore}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieDataScore.map((_, index) => (
                      <Cell
                        key={`score-cell-${index}`}
                        fill={isEnterprise ? COLORS_SCORE[index % COLORS_SCORE.length] : COLORS_CYBER[index % COLORS_CYBER.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--popover-foreground)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xs ${mutedTextClass}`}>总数</span>
                <span className={`text-3xl font-bold ${strongTextClass}`}>128</span>
                <span className={`text-[10px] ${mutedTextClass}`}>家店铺</span>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              {pieDataScore.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: isEnterprise ? COLORS_SCORE[index] : COLORS_CYBER[index] }}
                    />
                    <span className={`truncate ${legendTextClass}`}>{item.name}</span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className={`w-10 text-right ${strongTextClass}`}>{item.count} 家</span>
                    <span className={`w-10 text-right ${mutedTextClass}`}>{item.percent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`flex min-h-[300px] flex-col rounded-xl border p-4 ${cardClass}`}>
          <CardHeader
            title="问题分布 (差评行为)"
            description="按问题类型统计差评行为相关记录的数量和占比。"
          />
          <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(120px,0.9fr)_minmax(0,1.1fr)]">
            <div className="relative mx-auto h-full min-h-[160px] w-full max-w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataProblem}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieDataProblem.map((_, index) => (
                      <Cell key={`problem-cell-${index}`} fill={COLORS_PROBLEM[index % COLORS_PROBLEM.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--popover-foreground)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xs ${mutedTextClass}`}>问题总数</span>
                <span className={`text-3xl font-bold ${strongTextClass}`}>286</span>
                <span className={`text-[10px] ${mutedTextClass}`}>条</span>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              {pieDataProblem.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS_PROBLEM[index] }}
                    />
                    <span className={`truncate ${legendTextClass}`}>{item.name}</span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className={`w-10 text-right ${strongTextClass}`}>{item.count} 条</span>
                    <span className={`w-10 text-right ${mutedTextClass}`}>{item.percent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`flex min-h-[520px] flex-col rounded-xl border p-4 xl:col-span-4 xl:h-[640px] ${cardClass}`}>
        <CardHeader
          title="门店评分排行 (TOP10)"
          description="按综合评分从高到低展示当前排名前十的店铺。"
        />
        <div className={`mb-3 grid grid-cols-[42px_minmax(0,1fr)_70px] px-1 text-xs ${mutedTextClass}`}>
          <span>排名</span>
          <span>店铺名称</span>
          <span className="text-right">综合评分</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-between gap-2">
          {rankData.map((item, index) => (
            <div key={item.name} className="min-w-0">
              <div className="mb-1.5 grid grid-cols-[42px_minmax(0,1fr)_70px] items-center gap-0 text-sm">
                <span>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                      index === 0
                        ? 'bg-amber-400 text-slate-950'
                        : index === 1
                          ? 'bg-slate-300 text-slate-800'
                          : index === 2
                            ? 'bg-amber-700 text-white'
                            : isEnterprise
                              ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                </span>
                <span className={`truncate pr-3 font-medium ${legendTextClass}`}>{item.name}</span>
                <span className={`text-right font-mono ${strongTextClass}`}>{item.score.toFixed(1)}</span>
              </div>
              <div className={`ml-[42px] h-2 overflow-hidden rounded-full ${progressTrackClass}`}>
                <div
                  className="h-full rounded-full bg-[#0284c7] dark:bg-[#0ea5e9]"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
