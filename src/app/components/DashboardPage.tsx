'use client';

import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, CreditCard, 
  AlertTriangle, CheckCircle2, RefreshCw, Bell, 
  Calendar, ChevronDown, Activity, ShieldAlert
} from 'lucide-react';
import { RiskLevelIcon } from '@/app/components/ui/RiskLevelIcon';

// --- Mock Data based on Requirements ---

const trendData = [
  { date: '10-24', gmv: 45000, orders: 320 },
  { date: '10-25', gmv: 52000, orders: 350 },
  { date: '10-26', gmv: 49000, orders: 310 },
  { date: '10-27', gmv: 62000, orders: 480 },
  { date: '10-28', gmv: 85000, orders: 620 },
  { date: '10-29', gmv: 78000, orders: 550 },
  { date: '10-30', gmv: 92000, orders: 680 },
];

const channelData = [
  { name: '直播带货 (Live)', value: 45, color: '#f472b6' }, // Pink
  { name: '短视频 (Video)', value: 35, color: '#22d3ee' },  // Cyan
  { name: '商城 (Mall)', value: 20, color: '#818cf8' },      // Purple
];

const alertsData = [
  { id: 1, level: 'P0', title: '近1小时销售额跌幅 > 20%', time: '10m ago', status: '待处理' },
  { id: 2, level: 'P1', title: '直播间推流中断 (Room: 882)', time: '32m ago', status: '处理中' },
  { id: 3, level: 'P2', title: '库存同步延迟 (SKU: 9920)', time: '2h ago', status: '已忽略' },
];

const tasksData = [
  { name: 'API 数据同步', progress: 100, status: 'success' },
  { name: '数据清洗', progress: 78, status: 'running' },
  { name: '日报生成', progress: 12, status: 'waiting' },
];

// --- Styled Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`
    relative overflow-hidden
    bg-white/60 dark:bg-[#0f172a]/40 backdrop-blur-xl 
    border border-slate-200 dark:border-white/[0.08] 
    rounded-[24px] 
    shadow-sm dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]
    group
    ${className}
  `}>
    {/* Top Highlight */}
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-50" />
    {children}
  </div>
);

const NeonTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
  <div className="flex items-center gap-2 mb-4">
    {Icon && <Icon size={16} className="text-cyan-600 dark:text-cyan-400" />}
    <h3 className="text-sm font-bold font-mono tracking-[0.15em] text-cyan-600/80 dark:text-cyan-200/80 uppercase">
      {children}
    </h3>
  </div>
);

const KPICard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <GlassCard className="p-6 hover:bg-white/80 dark:hover:bg-[#0f172a]/60 transition-colors cursor-pointer border-l-2 border-l-transparent hover:border-l-cyan-400">
    <div className="flex justify-between items-start mb-2">
      <div className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase tracking-wider">{title}</div>
      <div className={`p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-cyan-600 dark:text-cyan-400 shadow-sm dark:shadow-[0_0_10px_rgba(34,211,238,0.1)]`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="mt-2">
      <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
        {value}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
        <span className="text-xs text-slate-500 font-mono">较昨日</span>
      </div>
    </div>
  </GlassCard>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#050714]/90 border border-slate-200 dark:border-cyan-500/30 p-3 rounded-lg backdrop-blur-md shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <p className="text-slate-900 dark:text-cyan-50 font-mono text-xs mb-1 border-b border-slate-200 dark:border-white/10 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs py-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
            <span className="font-bold font-mono" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Main Page Component ---

export default function DouyinDataHubDashboard() {
  const [dateRange, setDateRange] = useState('近7天');

  return (
    <div className="min-h-screen bg-transparent text-foreground font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Particles/Glows */}
      <div className="fixed top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-[1600px] mx-auto p-8 space-y-8 relative z-10">

        {/* Date Range Picker */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full transition-all group">
            <Calendar size={14} className="text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-mono text-slate-700 dark:text-cyan-100">{dateRange}</span>
            <ChevronDown size={14} className="text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
          </button>
        </div>

        {/* 1. Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="预估总GMV"
            value="¥ 1,245,890"
            trend={12.5}
            icon={CreditCard}
          />
          <KPICard
            title="总订单量"
            value="8,520"
            trend={5.2}
            icon={ShoppingBag}
          />
          <KPICard
            title="转化率"
            value="4.85%"
            trend={-0.8}
            icon={Activity}
          />
          <KPICard
            title="活跃用户"
            value="32,100"
            trend={18.1}
            icon={Users}
          />
        </div>

        {/* 2. Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          {/* Trend Chart */}
          <GlassCard className="lg:col-span-2 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <NeonTitle icon={TrendingUp}>运营趋势</NeonTitle>
              <div className="flex gap-2">
                 <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_#22d3ee]"></span> GMV
                 </span>
                 <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_5px_#818cf8]"></span> 订单
                 </span>
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#475569"
                    tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#475569"
                    tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="gmv"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fill="url(#colorGmv)"
                    style={{ filter: 'drop-shadow(0px 0px 4px rgba(34, 211, 238, 0.5))' }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fill="url(#colorOrders)"
                    style={{ filter: 'drop-shadow(0px 0px 4px rgba(129, 140, 248, 0.5))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Channel Pie Chart */}
          <GlassCard className="p-6 flex flex-col">
            <NeonTitle icon={Users}>渠道分布</NeonTitle>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {channelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{ filter: `drop-shadow(0px 0px 6px ${entry.color})` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">100%</span>
                <span className="text-[10px] text-slate-500 font-mono">来源</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-2 space-y-2">
              {channelData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 5px ${item.color}` }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* 3. Bottom Row: Alerts & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Risk Alerts */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <NeonTitle icon={ShieldAlert}>风险预警</NeonTitle>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 animate-pulse">
                3 warnings
              </span>
            </div>
            <div className="space-y-3">
              {alertsData.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <RiskLevelIcon level={alert.level} width={32} height={32} />
                    <div>
                      <div className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {alert.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        触发时间: {alert.time}
                      </div>
                    </div>
                  </div>
                  <div className={`text-[10px] px-2 py-1 rounded font-mono ${
                    alert.status === '待处理' ? 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/30' : 
                    alert.status === '处理中' ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30' : 'text-slate-500'
                  }`}>
                    {alert.status}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Task Monitoring */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <NeonTitle icon={RefreshCw}>任务状态</NeonTitle>
              <button className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 underline font-mono">
                查看日志
              </button>
            </div>
            <div className="space-y-5">
              {tasksData.map((task, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      {task.status === 'running' && <RefreshCw size={10} className="animate-spin text-cyan-600 dark:text-cyan-400"/>}
                      {task.status === 'success' && <CheckCircle2 size={10} className="text-emerald-600 dark:text-emerald-400"/>}
                      {task.name}
                    </span>
                    <span className="font-mono text-cyan-700 dark:text-cyan-100">{task.progress}%</span>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    {/* Animated Progress Bar */}
                    <div 
                      className={`h-full relative rounded-full ${
                        task.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                        task.status === 'running' ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 
                        'bg-slate-600'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    >
                      {task.status === 'running' && (
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] skew-x-[-20deg]" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      </main>
    </div>
  );
}