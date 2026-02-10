'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Package, Truck, MessageCircle, AlertTriangle,
  Activity, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
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
    <div className="w-full sticky top-0 z-20 pt-4 pb-2 bg-white/40 dark:bg-[#0f172a]/20 backdrop-blur-xl">
      <div className="flex overflow-x-auto p-2 md:justify-center gap-2 md:gap-4 px-4 no-scrollbar">
        {Object.entries(THEME_CONFIG).map(([key, config]) => {
          const isActive = activeTab === key;
          const data = METRICS_DATA[key as keyof typeof METRICS_DATA];
          
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-xl border transition-all duration-200 whitespace-nowrap
                ${isActive 
                  ? `bg-white dark:bg-slate-800 shadow-md ${config.light.text} ${config.dark.text} ${config.light.border} ${config.dark.border} ring-1 ${config.light.active} ${config.dark.active}`
                  : 'bg-white dark:bg-slate-900 border-transparent text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }
              `}
            >
              <config.icon size={24} />
              <span className="font-medium text-lg">{config.label}</span>
              <span className={`
                ml-1 px-2 py-1 rounded text-base font-mono font-bold
                ${isActive ? 'bg-slate-100 dark:bg-slate-950' : 'bg-transparent'}
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

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6 px-4">
      {subMetrics.map((item, index) => {
        const isSelected = selectedIndex === index;
        const isRisk = item.isRisk || themeKey === 'risk';
        
        // 动态计算样式
        // 风险项特殊处理：如果是 Risk 类型，始终偏红
        const activeConfig = isRisk ? THEME_CONFIG.risk : config;
        
        return (
          <div
            key={item.id}
            onClick={() => onSelect(index)}
            className={`
              relative cursor-pointer p-3 md:p-4 rounded-xl border transition-all duration-200
              flex flex-col justify-between min-h-[90px] md:min-h-[110px]
              w-[calc(50%-0.5rem)] md:w-64
              ${isSelected
                ? `bg-white/60 dark:bg-[#0f172a]/40 backdrop-blur-md shadow-lg scale-[1.02] border-white/30 dark:border-white/10 ${activeConfig.light.border} ${activeConfig.dark.border}`
                : 'bg-white/40 dark:bg-[#0f172a]/20 backdrop-blur-sm border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-[#0f172a]/40'
              }
            `}
          >
            {/* 选中时的左侧高亮条 (日间模式增强识别) */}
            {isSelected && (
              <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${isRisk ? 'bg-red-500' : 'bg-blue-500 dark:bg-cyan-500'}`} />
            )}

            <div className="flex justify-between items-start mb-2 pl-2">
              <span className={`text-xs md:text-sm font-medium line-clamp-1 ${isSelected ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {item.title}
              </span>
              {isRisk ? (
                 <ShieldAlert size={14} className={isSelected ? 'text-red-500' : 'text-slate-400'} />
              ) : (
                 <Activity size={14} className={isSelected ? 'text-blue-500 dark:text-cyan-400' : 'text-slate-400'} />
              )}
            </div>

            <div className="pl-2">
              <div className={`text-lg md:text-xl font-bold font-mono ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-500'}`}>
                {item.value}
              </div>
              {/* 仅在选中时显示的小装饰 */}
              {isSelected && (
                 <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] text-slate-400">查看详情</span>
                    <ArrowUpRight size={10} className="text-slate-400"/>
                 </div>
              )}
            </div>
          </div>
        );
      })}
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

      <div className="relative z-10 w-full md:py-6">
        
        {/* 核心导航 - 顶部横排 */}
        <TopNavigation activeTab={activeTab} onTabChange={handleTabChange as any} />

        {/* 主体内容区 */}
        <div className="mt-4 md:mt-8">
          
          {/* 子指标选择器 - 响应式网格 */}
          <SubMetricCards 
            subMetrics={currentData.subMetrics}
            selectedIndex={safeIndex}
            onSelect={setSelectedSubMetricIndex}
            themeKey={currentData.themeKey}
          />

          {/* 详情组件容器 - 使用磨砂玻璃特效 */}
          <div className="px-4">
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