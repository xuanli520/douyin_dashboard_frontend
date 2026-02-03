'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Responsive } from 'react-grid-layout';
import { WidthProvider } from '@/components/dashboard/WidthProvider';
import { useTheme } from 'next-themes';
import { 
  Moon, Sun, LayoutDashboard, LayoutTemplate, ChevronDown
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import CompassWidget from '@/components/dashboard/CompassWidget';
import ScoreGauge from '@/components/dashboard/ScoreGauge';
import MetricCard from '@/components/dashboard/MetricCard';
import LayoutCustomizer from '@/components/dashboard/LayoutCustomizer';
import KPIWidget from '@/components/dashboard/KPIWidget';
import TrendChartWidget from '@/components/dashboard/TrendChartWidget';
import ChannelPieWidget from '@/components/dashboard/ChannelPieWidget';
import RiskAlertsWidget from '@/components/dashboard/RiskAlertsWidget';
import TaskMonitorWidget from '@/components/dashboard/TaskMonitorWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- 样式包装器 ---
const GlassPanel = ({ children, className = "", noBorder = false }: { children: React.ReactNode, className?: string, noBorder?: boolean }) => (
  <div className={`
    glass-panel relative overflow-hidden transition-all duration-300
    bg-white/40 dark:bg-[#0f172a]/20 backdrop-blur-xl
    ${!noBorder ? 'rounded-2xl border border-white/20 dark:border-white/5 shadow-sm dark:shadow-none' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// --- 布局预设数据 (Layout Presets) ---
const LAYOUT_PRESETS: Record<string, any> = {
  standard: {
    lg: [
      { i: 'kpi-cards', x: 0, y: 0, w: 12, h: 4 },
      { i: 'trend-chart', x: 0, y: 4, w: 8, h: 8 },
      { i: 'channel-pie', x: 8, y: 4, w: 4, h: 8 },
      { i: 'risk-alerts', x: 0, y: 12, w: 6, h: 8 },
      { i: 'task-monitor', x: 6, y: 12, w: 6, h: 8 },
      { i: 'gauge-merchant', x: 0, y: 20, w: 3, h: 4 },
      { i: 'gauge-product', x: 3, y: 20, w: 3, h: 4 },
      { i: 'card-merchant', x: 6, y: 20, w: 3, h: 6 },
      { i: 'card-product', x: 9, y: 20, w: 3, h: 6 },
      { i: 'card-logistics', x: 0, y: 26, w: 6, h: 8 },
      { i: 'card-service', x: 6, y: 26, w: 6, h: 8 },
    ],
    md: [
      { i: 'kpi-cards', x: 0, y: 0, w: 6, h: 4 },
      { i: 'trend-chart', x: 0, y: 4, w: 6, h: 8 },
      { i: 'channel-pie', x: 0, y: 12, w: 6, h: 6 },
      { i: 'risk-alerts', x: 0, y: 18, w: 3, h: 8 },
      { i: 'task-monitor', x: 3, y: 18, w: 3, h: 8 },
      { i: 'gauge-merchant', x: 0, y: 26, w: 3, h: 4 },
      { i: 'gauge-product', x: 3, y: 26, w: 3, h: 4 },
      { i: 'card-merchant', x: 0, y: 30, w: 6, h: 6 },
      { i: 'card-product', x: 0, y: 36, w: 6, h: 6 },
      { i: 'card-logistics', x: 0, y: 42, w: 6, h: 6 },
      { i: 'card-service', x: 0, y: 48, w: 6, h: 6 },
    ]
  },
  focus: { // 聚焦模式：上方两个大指标，下方详细卡片平铺
    lg: [
      { i: 'kpi-cards', x: 0, y: 0, w: 12, h: 4 },
      { i: 'trend-chart', x: 0, y: 4, w: 8, h: 8 },
      { i: 'channel-pie', x: 8, y: 4, w: 4, h: 8 },
      { i: 'risk-alerts', x: 0, y: 12, w: 6, h: 8 },
      { i: 'task-monitor', x: 6, y: 12, w: 6, h: 8 },
      { i: 'gauge-merchant', x: 0, y: 20, w: 4, h: 4 },
      { i: 'gauge-product', x: 4, y: 20, w: 4, h: 4 },
      { i: 'card-logistics', x: 8, y: 20, w: 4, h: 4 },
      { i: 'card-merchant', x: 0, y: 24, w: 4, h: 8 },
      { i: 'card-product', x: 4, y: 24, w: 4, h: 8 },
      { i: 'card-service', x: 8, y: 24, w: 4, h: 8 },
    ],
    md: [
      { i: 'kpi-cards', x: 0, y: 0, w: 6, h: 4 },
      { i: 'trend-chart', x: 0, y: 4, w: 6, h: 8 },
      { i: 'channel-pie', x: 0, y: 12, w: 6, h: 6 },
      { i: 'risk-alerts', x: 0, y: 18, w: 3, h: 8 },
      { i: 'task-monitor', x: 3, y: 18, w: 3, h: 8 },
      { i: 'gauge-merchant', x: 0, y: 26, w: 2, h: 4 },
      { i: 'gauge-product', x: 2, y: 26, w: 2, h: 4 },
      { i: 'card-logistics', x: 4, y: 26, w: 2, h: 4 },
      { i: 'card-merchant', x: 0, y: 30, w: 2, h: 8 },
      { i: 'card-product', x: 2, y: 30, w: 2, h: 8 },
      { i: 'card-service', x: 4, y: 30, w: 2, h: 8 },
    ]
  },
  grid: { // 网格模式：均匀分布
    lg: [
      { i: 'kpi-cards', x: 0, y: 0, w: 12, h: 4 },
      { i: 'trend-chart', x: 0, y: 4, w: 6, h: 8 },
      { i: 'channel-pie', x: 6, y: 4, w: 6, h: 8 },
      { i: 'risk-alerts', x: 0, y: 12, w: 4, h: 8 },
      { i: 'task-monitor', x: 4, y: 12, w: 4, h: 8 },
      { i: 'gauge-merchant', x: 8, y: 12, w: 4, h: 4 },
      { i: 'gauge-product', x: 8, y: 16, w: 4, h: 4 },
      { i: 'card-merchant', x: 0, y: 20, w: 4, h: 6 },
      { i: 'card-product', x: 4, y: 20, w: 4, h: 6 },
      { i: 'card-logistics', x: 8, y: 20, w: 4, h: 6 },
      { i: 'card-service', x: 0, y: 26, w: 12, h: 6 },
    ],
    md: [
      { i: 'kpi-cards', x: 0, y: 0, w: 6, h: 4 },
      { i: 'trend-chart', x: 0, y: 4, w: 6, h: 8 },
      { i: 'channel-pie', x: 0, y: 12, w: 6, h: 6 },
      { i: 'risk-alerts', x: 0, y: 18, w: 3, h: 8 },
      { i: 'task-monitor', x: 3, y: 18, w: 3, h: 8 },
      { i: 'gauge-merchant', x: 0, y: 26, w: 3, h: 4 },
      { i: 'gauge-product', x: 3, y: 26, w: 3, h: 4 },
      { i: 'card-merchant', x: 0, y: 30, w: 2, h: 6 },
      { i: 'card-product', x: 2, y: 30, w: 2, h: 6 },
      { i: 'card-logistics', x: 4, y: 30, w: 2, h: 6 },
      { i: 'card-service', x: 0, y: 36, w: 6, h: 6 },
    ]
  }
};

// --- 新组件的默认布局配置 ---
const DEFAULT_LAYOUTS: Record<string, any> = {
  lg: { w: 6, h: 10 },
  md: { w: 6, h: 10 },
  sm: { w: 4, h: 8 },
  xs: { w: 2, h: 8 },
  xxs: { w: 2, h: 8 }
};

const WIDGETS = [
  { id: 'gauge-merchant', title: '商家体验分', type: 'gauge', data: { score: 100 } },
  { id: 'gauge-product', title: '商品体验分', type: 'gauge', data: { score: 99 } },
  { id: 'kpi-cards', title: '核心指标', type: 'kpi' },
  { id: 'trend-chart', title: '运营趋势', type: 'trend' },
  { id: 'channel-pie', title: '渠道分布', type: 'channel' },
  { id: 'risk-alerts', title: '风险预警', type: 'risk' },
  { id: 'task-monitor', title: '任务状态', type: 'task' },
  {
    id: 'card-merchant', title: '商家体验详情', type: 'metric',
    data: {
      totalScore: 100, totalLabel: '体验总分',
      items: [
        { label: '商品体验', score: 99 },
        { label: '物流体验', score: 100 },
        { label: '服务体验', score: 100 },
        { label: '纠纷投诉', score: 100 },
      ]
    }
  },
  {
    id: 'card-product', title: '商品体验详情', type: 'metric',
    data: {
      totalScore: 89, totalLabel: '综合评分',
      items: [
        { label: '好评率', score: 95 },
        { label: '品质退货率', score: 70, isWarning: true },
        { label: '品退率(行业)', score: 90 },
      ]
    }
  },
  {
    id: 'card-logistics', title: '物流体验详情', type: 'metric',
    data: {
      totalScore: 92, totalLabel: '物流总分',
      items: [
        { label: '揽收时效', score: 100 },
        { label: '配送时效', score: 50, isWarning: true },
        { label: '物流退货率', score: 80 },
        { label: '承诺达标率', score: 98 },
        { label: '发货及时率', score: 100 },
      ]
    }
  },
  {
    id: 'card-service', title: '服务体验详情', type: 'metric',
    data: {
      totalScore: 100, totalLabel: '服务总分',
      items: [
        { label: '飞鸽响应', score: 100 },
        { label: '仅退款时长', score: 100 },
        { label: '售后满意度', score: 98 },
        { label: '平台介入率', score: 100 },
      ]
    }
  },
];

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Layout State
  const [layouts, setLayouts] = useState(LAYOUT_PRESETS.standard);
  const [currentPreset, setCurrentPreset] = useState('standard');

  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    WIDGETS.forEach(w => initial[w.id] = true);
    return initial;
  });

  useEffect(() => {
    setMounted(true);
    const savedLayouts = localStorage.getItem('compass_layouts');
    const savedVisibility = localStorage.getItem('compass_visibility');
    // 如果本地没有存Layout，默认使用 Standard
    if (savedLayouts) {
        try { setLayouts(JSON.parse(savedLayouts)); } catch (e) {}
    }
    if (savedVisibility) try { setVisibleWidgets(JSON.parse(savedVisibility)); } catch (e) {}
  }, []);

  const onLayoutChange = useCallback((currentLayout: any, allLayouts: any) => {
    if (!mounted) return;
    setLayouts(allLayouts);
    localStorage.setItem('compass_layouts', JSON.stringify(allLayouts));
  }, [mounted]);

  // 处理预设切换
  const handlePresetChange = (value: string) => {
    setCurrentPreset(value);
    const newLayout = LAYOUT_PRESETS[value];
    if (newLayout) {
        setLayouts(newLayout);
        localStorage.setItem('compass_layouts', JSON.stringify(newLayout));
        // 切换预设时，通常希望重置所有Widget为可见，或者保持当前可见性，这里保持当前可见性
    }
  };

  // 添加组件时设置默认布局
  const addWidgetLayout = useCallback((id: string, currentLayouts: any) => {
    const newLayouts = { ...currentLayouts };
    const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];

    breakpoints.forEach(bp => {
      const defaultSize = DEFAULT_LAYOUTS[bp];
      newLayouts[bp] = [
        ...(newLayouts[bp] || []),
        {
          i: id,
          x: 0,
          y: Infinity, // 放在最后
          w: defaultSize.w,
          h: defaultSize.h
        }
      ];
    });

    return newLayouts;
  }, []);

  const toggleWidget = useCallback((id: string, visible: boolean) => {
    let newLayouts = { ...layouts };

    // 如果是添加组件，为其设置默认布局
    if (visible) {
      const hasLayout = layouts.lg?.some((item: any) => item.i === id);
      if (!hasLayout) {
        newLayouts = addWidgetLayout(id, layouts);
        setLayouts(newLayouts);
        localStorage.setItem('compass_layouts', JSON.stringify(newLayouts));
      }
    }

    const newVisibility = { ...visibleWidgets, [id]: visible };
    setVisibleWidgets(newVisibility);
    localStorage.setItem('compass_visibility', JSON.stringify(newVisibility));
  }, [visibleWidgets, layouts, addWidgetLayout]);

  if (!mounted) return <div className="min-h-screen bg-canvas" />;

  const activeWidgets = WIDGETS.filter(w => visibleWidgets[w.id]);

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-sans selection:bg-primary selection:text-white overflow-hidden relative transition-colors duration-500">
      
      {/* 背景光效 */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 dark:opacity-40 overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary blur-[120px] opacity-20 animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary blur-[150px] opacity-20"></div>
      </div>

      {/* --- Header (Command Bar) --- */}
      <header className="sticky top-0 z-50 w-full mb-4 pt-4 px-6">
        <GlassPanel className="container mx-auto h-20 flex items-center justify-between px-6 shadow-lg backdrop-blur-2xl">
          
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary filter drop-shadow-sm">
                  COMPASS
                </span>
              </h1>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em]">Dashboard</span>
            </div>

            <div className="h-6 w-[1px] bg-border/40 mx-2 hidden md:block" />

            {/* Shop Selector */}
            <Select defaultValue="kailas">
              <SelectTrigger className="w-[180px] border-none bg-transparent hover:bg-surface/10 text-text-primary focus:ring-0 transition-all rounded-lg h-9 font-medium shadow-none pl-2">
                <SelectValue placeholder="Select Store" />
              </SelectTrigger>
              <SelectContent className="bg-surface/95 backdrop-blur-xl border-border/20 text-text-primary shadow-xl">
                <SelectItem value="kailas">Kailas 旗舰店</SelectItem>
                <SelectItem value="demo">Demo Store</SelectItem>
              </SelectContent>
            </Select>

            {/* --- 新增：Layout Preset Selector --- */}
            <Select value={currentPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-[140px] border-none bg-transparent hover:bg-surface/10 text-text-muted hover:text-text-primary focus:ring-0 transition-all rounded-lg h-9 text-xs font-medium shadow-none pl-2 flex gap-2">
                 <LayoutTemplate size={14} />
                 <SelectValue placeholder="布局" />
              </SelectTrigger>
              <SelectContent className="bg-surface/95 backdrop-blur-xl border-border/20 text-text-primary shadow-xl">
                <SelectItem value="standard">标准视图</SelectItem>
                <SelectItem value="focus">聚焦模式</SelectItem>
                <SelectItem value="grid">网格布局</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            
            {/* --- 重点修复: Time Filter Tabs (高对比度优化) --- */}
            {/* 增加背景色深度，文字颜色改为 slate-500，选中状态改为强对比（白底黑字/深色模式下反转） */}
            <Tabs defaultValue="day" className="w-[140px] hidden md:block">
              <TabsList className="grid w-full grid-cols-2 h-9 bg-slate-100/80 dark:bg-slate-800/60 rounded-lg p-1 border border-black/5 dark:border-white/5">
                <TabsTrigger 
                  value="day" 
                  className="rounded-md text-[11px] font-semibold transition-all duration-200
                             text-slate-500 dark:text-slate-400
                             data-[state=active]:bg-white data-[state=active]:text-slate-900 
                             data-[state=active]:shadow-sm
                             dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  本日
                </TabsTrigger>
                <TabsTrigger 
                  value="week" 
                  className="rounded-md text-[11px] font-semibold transition-all duration-200
                             text-slate-500 dark:text-slate-400
                             data-[state=active]:bg-white data-[state=active]:text-slate-900 
                             data-[state=active]:shadow-sm
                             dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  本周
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="h-4 w-[1px] bg-border/40 mx-1 hidden md:block" />

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
                <LayoutCustomizer 
                  items={WIDGETS.map(w => ({ i: w.id, title: w.title, visible: !!visibleWidgets[w.id] }))}
                  onToggle={toggleWidget}
                />

                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`w-9 h-9 rounded-full transition-all relative ${
                     isEditMode 
                     ? "bg-primary text-white shadow-[0_0_12px_theme(colors.primary)] hover:bg-primary/90" 
                     : "text-text-secondary hover:text-primary hover:bg-primary/10"
                  }`}
                  title={isEditMode ? "Finish Editing" : "Edit Layout"}
                >
                  <LayoutDashboard size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="w-9 h-9 text-text-secondary hover:text-secondary hover:bg-secondary/10 rounded-full"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
            </div>
          </div>
        </GlassPanel>
      </header>

      {/* --- Main Content --- */}
      <main className="relative z-10 p-6 pt-0 h-[calc(100vh-110px)] overflow-y-auto overflow-x-hidden scrollbar-none">
        <div className="mx-auto max-w-[1600px]">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 6, sm: 4, xs: 2, xxs: 2 }}
            rowHeight={40}
            // --- v2 API: 使用 dragConfig/resizeConfig 对象式 API ---
            dragConfig={{ enabled: isEditMode, handle: '.drag-handle' }}
            resizeConfig={{ enabled: isEditMode }}
            onLayoutChange={onLayoutChange}
            margin={[20, 20]}
          >
            {activeWidgets.map((widget) => (
              <div key={widget.id}>
                {/* 卡片容器 */}
                <GlassPanel className={`h-full flex flex-col group transition-all duration-300 ${
                    isEditMode 
                    ? 'border-primary border-dashed bg-primary/5 ring-1 ring-primary/20 z-20' // 编辑模式样式加强
                    : 'hover:border-primary/30'
                }`}>
                  <CompassWidget 
                    title={widget.title}
                    isEditMode={isEditMode}
                    onRemove={() => toggleWidget(widget.id, false)}
                    className="h-full bg-transparent p-0 shadow-none border-none" 
                    // --- 核心修复：只有在 EditMode 时，才添加 cursor-move 类名 ---
                    headerClassName={`px-5 py-4 flex items-center justify-between border-b border-border/10 transition-colors ${
                        isEditMode ? 'drag-handle cursor-move bg-primary/5' : 'cursor-default'
                    }`}
                    titleClassName="text-sm font-medium text-text-primary tracking-wide select-none"
                  >
                    <div className="p-5 flex-1 h-full overflow-hidden relative select-none">
                      {widget.type === 'gauge' ? (
                        <div className="flex flex-col items-center justify-center h-full">
                           <ScoreGauge score={widget.data.score} label={widget.title} />
                        </div>
                      ) : widget.type === 'metric' ? (
                        <MetricCard
                          totalScore={widget.data.totalScore!}
                          totalLabel={widget.data.totalLabel}
                          items={widget.data.items!}
                        />
                      ) : widget.type === 'kpi' ? (
                        <KPIWidget />
                      ) : widget.type === 'trend' ? (
                        <TrendChartWidget />
                      ) : widget.type === 'channel' ? (
                        <ChannelPieWidget />
                      ) : widget.type === 'risk' ? (
                        <RiskAlertsWidget />
                      ) : widget.type === 'task' ? (
                        <TaskMonitorWidget />
                      ) : null}
                    </div>
                  </CompassWidget>
                </GlassPanel>
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </main>
    </div>
  );
}