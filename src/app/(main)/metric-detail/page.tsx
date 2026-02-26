'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Package, Truck, MessageCircle, AlertTriangle,
  Activity
} from 'lucide-react';
import IndicatorDetailPage from '@/components/dashboard/IndicatorDetailPage';
import type { Indicator } from '@/types/indicator';

// --- 磨砂玻璃面板组件 (参考罗盘页面) ---
const GlassPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`
    relative overflow-hidden transition-all duration-300
    bg-white/40 dark:bg-[#0f172a]/20 backdrop-blur-xl
    rounded-2xl border border-white/20 dark:border-white/5 shadow-sm dark:shadow-none
    ${className}
  `}>
    {children}
  </div>
);

// --- 模拟数据 (保持不变) ---
const CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-01-${i + 1}`,
  value: 4.8 + Math.random() * 0.2
}));

// --- 配色配置系统 (关键修改：增加 light 和 dark 两套色值) ---
const THEME_CONFIG = {
  product: {
    label: '商品体验',
    icon: Package,
    light: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700', active: 'ring-blue-500' },
    dark:  { border: 'dark:border-cyan-500/50', bg: 'dark:bg-cyan-900/20', text: 'dark:text-cyan-400', active: 'dark:shadow-cyan-500/50' }
  },
  logistics: {
    label: '物流体验',
    icon: Truck,
    light: { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-700', active: 'ring-orange-500' },
    dark:  { border: 'dark:border-amber-500/50', bg: 'dark:bg-amber-900/20', text: 'dark:text-amber-400', active: 'dark:shadow-amber-500/50' }
  },
  service: {
    label: '服务体验',
    icon: MessageCircle,
    light: { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700', active: 'ring-purple-500' },
    dark:  { border: 'dark:border-purple-500/50', bg: 'dark:bg-purple-900/20', text: 'dark:text-purple-400', active: 'dark:shadow-purple-500/50' }
  },
  risk: {
    label: '差行为/违规',
    icon: AlertTriangle,
    light: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700', active: 'ring-red-500' },
    dark:  { border: 'dark:border-red-500/50', bg: 'dark:bg-red-900/20', text: 'dark:text-red-400', active: 'dark:shadow-red-500/50' }
  }
};

const METRICS_DATA = {
  product: {
    id: 'product',
    score: 100,
    themeKey: 'product',
    subMetrics: [
      { id: 'p1', title: '商品综合评分', score: 100, weight: '90%', value: '4.8702', unit: '分', desc: '近30天消费者评价加权平均分' },
      { id: 'p2', title: '商品品质退货率', score: 100, weight: '10%', value: '0.195%', unit: '', desc: '品质原因退货占比' }
    ]
  },
  logistics: {
    id: 'logistics',
    score: 100,
    themeKey: 'logistics',
    subMetrics: [
      { id: 'l1', title: '揽收时效达成率', score: 100, weight: '15%', value: '100%', unit: '' },
      { id: 'l2', title: '运单配送时效达成率', score: 100, weight: '70%', value: '95.79%', unit: '' },
      { id: 'l3', title: '发货物流品退率', score: 100, weight: '15%', value: '0.02%', unit: '' }
    ]
  },
  service: {
    id: 'service',
    score: 100,
    themeKey: 'service',
    subMetrics: [
      { id: 's1', title: '飞鸽平均响应时长', score: 100, weight: '70%', value: '10.6s', unit: '' },
      { id: 's2', title: '售后处理时长达成率', score: 100, weight: '30%', value: '95.6%', unit: '' }
    ]
  },
  risk: {
    id: 'risk',
    score: 0,
    themeKey: 'risk',
    isDeduction: true,
    subMetrics: [
      { id: 'r1', title: '虚假交易刷体验分扣分', score: 0, value: '0分', unit: '', isRisk: true },
      { id: 'r2', title: '影响消费者体验扣分', score: 0, value: '0分', unit: '', isRisk: true }
    ]
  }
};

// --- 简单的转换逻辑 ---
function convertToIndicator(data: any, subMetric: any): Indicator {
  if (!subMetric) return {} as any;
  return {
    categoryId: data.id,
    categoryName: THEME_CONFIG[data.themeKey as keyof typeof THEME_CONFIG].label,
    name: subMetric.title || '-',
    score: subMetric.score || 0,
    weight: subMetric.weight ? parseFloat(subMetric.weight) : 0,
    scoreRanges: [{ score: subMetric.score || 0, value: subMetric.value || '-', range: '-' }],
    formula: { variables: [], display: subMetric.desc || '' },
    notes: subMetric.desc ? [subMetric.desc] : [],
    trend: CHART_DATA, // 简化处理，实际应透传真实数据
  };
}

// --- 组件：顶部响应式导航 ---
const TopNavigation = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) => {
  return (
    <div className="filter-bar-container metric-detail-primary-switch">
      <div className="metric-detail-primary-switch-list flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar md:justify-center">
        {Object.entries(THEME_CONFIG).map(([key, config]) => {
          const isActive = activeTab === key;
          const data = METRICS_DATA[key as keyof typeof METRICS_DATA];
          
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={`filter-bar-tab metric-detail-primary-switch-item shrink-0 ${isActive ? 'filter-bar-tab-active' : ''}`}
            >
              <config.icon size={16} />
              <span className="text-sm font-medium">{config.label}</span>
              <span className={`
                metric-detail-primary-switch-score rounded px-2 py-0.5 text-xs font-mono font-semibold
                ${isActive ? 'bg-slate-200/80 text-slate-900 dark:bg-slate-700 dark:text-slate-100' : 'bg-white/10 text-slate-200 dark:bg-slate-800/70 dark:text-slate-300'}
              `}>
                {data.score}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- 组件：自适应子指标卡片 ---
const SubMetricCards = ({ 
  subMetrics, 
  selectedIndex, 
  onSelect,
  themeKey
}: { 
  subMetrics: any[], 
  selectedIndex: number, 
  onSelect: (idx: number) => void,
  themeKey: string
}) => {
  const config = THEME_CONFIG[themeKey as keyof typeof THEME_CONFIG];
  const isRiskCategory = themeKey === 'risk';

  return (
    <div className="metric-detail-sub-switch-container rounded-2xl border border-slate-200/70 bg-white/70 p-2 backdrop-blur-sm shadow-sm dark:border-white/10 dark:bg-[#0f172a]/40 dark:shadow-none">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {subMetrics.map((item, index) => {
        const isSelected = selectedIndex === index;
        const isRisk = item.isRisk || isRiskCategory;
        const activeConfig = isRisk ? THEME_CONFIG.risk : config;
        
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`
              metric-detail-sub-switch-item
              shrink-0 min-w-[220px] rounded-xl border px-3 py-2 text-left transition-all duration-200
              ${isSelected
                ? `bg-white dark:bg-slate-900 ${activeConfig.light.text} ${activeConfig.dark.text} ${activeConfig.light.border} ${activeConfig.dark.border} shadow-sm`
                : 'bg-white/55 text-slate-600 border-slate-200/80 hover:bg-white dark:bg-slate-900/45 dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-900/70'
              }
            `}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium">{item.title}</span>
              <span className={`text-xs font-mono font-semibold ${isSelected ? 'text-current' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.value}
              </span>
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
};

// --- 主内容 ---
function MetricDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 状态：当前 Tab 和 选中的子指标
  const typeParam = searchParams.get('type') as keyof typeof METRICS_DATA;
  const initialTab = (typeParam && METRICS_DATA[typeParam]) ? typeParam : 'product';
  const [activeTab, setActiveTab] = useState<keyof typeof METRICS_DATA>(initialTab);
  const [selectedSubMetricIndex, setSelectedSubMetricIndex] = useState(0);

  useEffect(() => {
    // 切换大类时重置子选项
    if (typeParam && METRICS_DATA[typeParam]) {
      setActiveTab(typeParam);
      setSelectedSubMetricIndex(0);
    }
  }, [typeParam]);

  const handleTabChange = (key: keyof typeof METRICS_DATA) => {
    setActiveTab(key);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('type', key);
    router.replace(`?${newParams.toString()}`);
  };

  const currentData = METRICS_DATA[activeTab];
  const safeIndex = Math.min(selectedSubMetricIndex, currentData.subMetrics.length - 1);
  const currentSubMetric = currentData.subMetrics[safeIndex];

  return (
    <div className={`
      min-h-screen transition-colors duration-300 font-sans
      bg-slate-50 text-slate-900
      dark:bg-[#020617] dark:text-slate-100
    `}>
      
      {/* 背景特效：仅在暗黑模式显示 */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-100 transition-opacity duration-500">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 blur-[100px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-900/20 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full space-y-4 px-4 py-4 md:px-6 md:py-6">
        <TopNavigation activeTab={activeTab} onTabChange={handleTabChange as any} />

        <SubMetricCards 
          subMetrics={currentData.subMetrics}
          selectedIndex={safeIndex}
          onSelect={setSelectedSubMetricIndex}
          themeKey={currentData.themeKey}
        />

        <GlassPanel className="p-1 min-h-[400px]">
          {currentSubMetric ? (
            <IndicatorDetailPage
              indicator={convertToIndicator(currentData, currentSubMetric)}
              onBack={() => {}}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Activity className="mb-2 animate-pulse" />
              <p>加载中...</p>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}

export default function MetricDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <MetricDetailContent />
    </Suspense>
  );
}
