'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useThemeStore } from '@/stores/themeStore';
import { HelpCircle, AlertTriangle, Store, Package, Truck, HeadphonesIcon, ShieldCheck } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  change: number;
  icon?: React.ElementType;
  data: any[];
  isWarning?: boolean;
  isPrimary?: boolean;
}

export function MetricCard({ title, value, suffix = '', change, icon: Icon, data, isWarning, isPrimary }: MetricCardProps) {
  const { appTheme } = useThemeStore();
  const isEnterprise = appTheme === 'enterprise';
  const chartGradientId = React.useId().replace(/:/g, '');

  const isPositive = change >= 0;
  // up triangle for positive, down for negative
  const changeSymbol = isPositive ? '↑' : '↓';
  const changeArrow = isPositive ? '▲' : '▼';
  
  // Logic for color:
  // Normal metrics: Up is Good (Green/Blue depending on theme?), Down is Bad (Red)
  // Actually looking at mockups:
  // Enterprise: Up is Blue (`↑ 0.8`), Down is Red (`↓ 0.3`)
  // Cyberpunk: Up is Green (`+0.5 ▲`), Down is Red (`-0.3 ▼`)
  // For Warning (差评风险):
  // Cyberpunk mockup shows `-0.4% ▼` in Green (down is good).
  // Enterprise mockup shows `↓ 0.3%` in Red (wait, down is red even though it's good? That might be a mistake in the mockup, let's use logic: down is good).
  
  let changeColor = '';
  if (isWarning) {
    changeColor = isPositive ? 'text-red-500' : 'text-emerald-500';
  } else {
    if (isEnterprise) {
      changeColor = isPositive ? 'text-blue-500' : 'text-red-500';
    } else {
      changeColor = isPositive ? 'text-emerald-500' : 'text-red-500';
    }
  }

  // Theme colors
  const bgClass = isEnterprise
    ? 'bg-white dark:bg-[var(--card)] border-slate-100 dark:border-[var(--border)] shadow-sm dark:shadow-[0_20px_45px_-24px_rgba(0,0,0,0.85)]'
    : 'bg-white/90 dark:bg-[#0a101f]/80 border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none';
  const titleClass = isEnterprise ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-300';
  const valueClass = isPrimary 
    ? (isEnterprise ? 'text-[#2563eb] dark:text-[#38bdf8]' : 'text-slate-900 dark:text-white') 
    : (isWarning ? 'text-red-500 dark:text-red-400' : (isEnterprise ? 'text-[#2563eb] dark:text-[#38bdf8]' : 'text-slate-900 dark:text-white'));
  
  const chartColor = isEnterprise ? '#3b82f6' : '#0ea5e9'; // Blue for enterprise, Cyan for cyber
  const warningChartColor = '#ef4444'; // Red for warnings
  const strokeColor = isWarning ? warningChartColor : chartColor;
  const gradientStartOpacity = isWarning ? 0.32 : (isEnterprise ? 0.2 : 0.4);
  const gradientEndOpacity = isWarning ? 0.12 : 0;

  return (
    <div className={`rounded-xl border p-5 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md ${bgClass} ${isPrimary ? (isEnterprise ? 'col-span-2 row-span-2 border-blue-100 bg-blue-50/30 dark:border-[#0ea5e9]/30 dark:bg-[#0f172a]/90' : 'col-span-2 row-span-2 bg-gradient-to-b from-white/90 to-[#0ea5e9]/10 dark:from-[#0a101f]/80 dark:to-[#0ea5e9]/10 border-[#0ea5e9]/30') : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-1.5 text-sm ${titleClass}`}>
          <span>{title}</span>
          <HelpCircle className="w-3.5 h-3.5 opacity-60 cursor-help" />
        </div>
        {Icon && (
          <div className={`p-1.5 rounded-full ${isWarning ? (isEnterprise ? 'bg-red-50 text-red-500' : 'bg-red-500/10 text-red-400') : (isEnterprise ? 'bg-blue-50 text-blue-500' : 'text-[#0ea5e9]')}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className={`flex flex-col flex-1 justify-center ${isPrimary ? 'items-center mt-4' : 'items-start mt-2'}`}>
        <div className="flex items-baseline gap-1 z-10">
          <span className={`${isPrimary ? 'text-6xl tracking-tight' : 'text-4xl'} font-bold ${valueClass}`}>
            {value}
          </span>
          {suffix && <span className={`${isPrimary ? 'text-2xl' : 'text-xl'} ${valueClass}`}>{suffix}</span>}
        </div>
        
        {/* Primary specific pedestal glow (mocked with CSS) */}
        {isPrimary && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-blue-500/20 dark:bg-sky-500/15 blur-2xl rounded-full pointer-events-none" />
        )}
      </div>

      {/* Change Indicator */}
      <div className={`flex items-center gap-2 text-sm z-10 mt-4 ${isPrimary ? 'justify-center' : 'justify-start'}`}>
        <span className={titleClass}>{isEnterprise ? '' : '较昨日'}</span>
        <span className={`flex items-center font-medium ${changeColor}`}>
          {isEnterprise ? (
            <>{changeSymbol} {Math.abs(change)} {isPrimary ? '较昨日' : '较昨日'}</>
          ) : (
             <>{change > 0 ? '+' : '-'}{Math.abs(change)}{suffix && suffix !== '分' ? suffix : ''} {changeArrow}</>
          )}
        </span>
      </div>

      {/* Mini Sparkline Chart */}
      {!isPrimary && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-80 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`metric-area-${chartGradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={gradientStartOpacity} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={gradientEndOpacity} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#metric-area-${chartGradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// Helper to generate sparkline data
const generateSparkline = () => Array.from({ length: 10 }, () => ({ value: 40 + Math.random() * 60 }));

export function MetricsGrid() {
  return (
    <div className="grid grid-cols-6 gap-4 w-full">
      <MetricCard 
        title="综合评分 (店铺平均分)" 
        value="96.8" 
        change={0.6} 
        data={[]} 
        isPrimary
      />
      <MetricCard 
        title="商品体验分" 
        value="97.2" 
        change={0.8} 
        icon={Package} 
        data={generateSparkline()} 
      />
      <MetricCard 
        title="物流体验分" 
        value="95.6" 
        change={-0.3} 
        icon={Truck} 
        data={generateSparkline()} 
      />
      <MetricCard 
        title="服务体验分" 
        value="96.4" 
        change={0.5} 
        icon={HeadphonesIcon} 
        data={generateSparkline()} 
      />
      <MetricCard 
        title="差评风险 (差评行为分)" 
        value="1.8" 
        suffix="%" 
        change={-0.4} 
        icon={AlertTriangle} 
        data={generateSparkline()} 
        isWarning
      />
    </div>
  );
}

export function SummaryBar() {
  const { appTheme } = useThemeStore();
  const isEnterprise = appTheme === 'enterprise';

  const bgClass = isEnterprise
    ? 'bg-white dark:bg-[var(--card)] border-slate-100 dark:border-[var(--border)] shadow-sm dark:shadow-[0_20px_45px_-24px_rgba(0,0,0,0.85)]'
    : 'bg-white/90 dark:bg-[#0a101f]/80 border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none';
  const textClass = isEnterprise ? 'text-slate-700 dark:text-slate-300' : 'text-slate-700 dark:text-slate-300';
  return (
    <div className={`w-full rounded-xl border p-4 flex items-center justify-center gap-16 ${bgClass}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${isEnterprise ? 'bg-blue-50 text-blue-500' : 'bg-blue-500/10 text-[#0ea5e9]'}`}>
           <Store className="w-5 h-5" />
        </div>
        <span className={`${textClass} font-medium`}>监控店铺数</span>
        <span className={`text-3xl font-bold ml-2 ${isEnterprise ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900 dark:text-white'}`}>128 <span className={`text-sm font-normal ${textClass}`}>家</span></span>
      </div>
      
      <div className="w-px h-10 bg-slate-200 dark:bg-white/10"></div>
      
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${isEnterprise ? 'bg-blue-50 text-blue-500' : 'bg-blue-500/10 text-[#0ea5e9]'}`}>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <span className={`${textClass} font-medium`}>数据覆盖率</span>
        <span className={`text-3xl font-bold ml-2 ${isEnterprise ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900 dark:text-white'}`}>98.6%</span>
      </div>
    </div>
  );
}
