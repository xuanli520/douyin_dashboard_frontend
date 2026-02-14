'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Responsive } from 'react-grid-layout';
import { WidthProvider } from '@/components/dashboard/WidthProvider';
import { useTheme } from 'next-themes';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  Moon, Sun, LayoutDashboard, LayoutTemplate
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { SHOP_OPTIONS } from '@/data/shops';
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

// --- 布局预设数据 ---
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
  focus: { 
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
  grid: { 
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

const DEFAULT_LAYOUTS: Record<string, any> = {
  lg: { w: 6, h: 10 },
  md: { w: 6, h: 10 },
  sm: { w: 4, h: 8 },
  xs: { w: 2, h: 8 },
  xxs: { w: 2, h: 8 }
};

interface WidgetData {
  score?: number;
  totalScore?: number;
  totalLabel?: string;
  items?: Array<{ label: string; score: number; isWarning?: boolean }>;
}

interface WidgetItem {
  id: string;
  title: string;
  type: 'gauge' | 'kpi' | 'trend' | 'channel' | 'risk' | 'task' | 'metric';
  data?: WidgetData;
}

const WIDGETS: WidgetItem[] = [
  { id: 'gauge-merchant', title: '商家体验分', type: 'gauge', data: { score: 100 } },
  { id: 'gauge-product', title: '商品体验分', type: 'gauge', data: { score: 100 } },
  { id: 'kpi-cards', title: '核心指标', type: 'kpi' },
  { id: 'trend-chart', title: '运营趋势', type: 'trend' },
  { id: 'channel-pie', title: '渠道分布', type: 'channel' },
  { id: 'risk-alerts', title: '风险预警', type: 'risk' },
  { id: 'task-monitor', title: '任务状态', type: 'task' },
  {
    id: 'card-product', title: '商品体验详情', type: 'metric',
    data: {
      totalScore: 100, totalLabel: '商品体验得分',
      items: [
        // 明确等于：商品综合评分得分 + 商品品质退货率得分
        { label: '商品综合评分得分', score: 100 },
        { label: '商品品质退货率得分', score: 100 },
      ]
    }
  },
  {
    id: 'card-logistics', title: '物流体验详情', type: 'metric',
    data: {
      totalScore: 100, totalLabel: '物流体验得分',
      items: [
        // 明确等于：揽收时效 + 运单配送时效 + 发货物流品退率
        { label: '揽收时效达成率得分', score: 100 },
        { label: '运单配送时效达成率得分', score: 100 },
        { label: '发货物流品退率得分', score: 100 },
      ]
    }
  },
  {
    id: 'card-service', title: '服务体验详情', type: 'metric',
    data: {
      totalScore: 100, totalLabel: '服务体验得分',
      items: [
        // 明确等于：飞鸽响应 + 售后处理时长
        { label: '飞鸽平均响应时长得分', score: 100 },
        { label: '售后处理时长达成率得分', score: 100 },
      ]
    }
  },
  {
    id: 'card-merchant', title: '差行为详情', type: 'metric',
    data: {
      totalScore: 0, totalLabel: '差行为扣分',
      items: [
        // 明确等于：虚假交易扣分 + 影响消费者体验扣分
        { label: '虚假交易刷体验分扣分', score: 0 },
        { label: '影响消费者体验扣分', score: 0 },
      ]
    }
  },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center">加载中...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}

function DashboardPageContent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Store selection state
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const storeId = searchParams.get('storeId') || 'c1';

  const handleStoreChange = (newStoreId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('storeId', newStoreId);
    router.push(`${pathname}?${params.toString()}`);
  };

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
    }
  };

  // 添加组件时设置默认布局
  const addWidgetLayout = useCallback((id: string, currentLayouts: any) => {
    const newLayouts = { ...currentLayouts };
    const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
    const itemsPerRow = parseInt(currentPreset) || 3;
    const cols = 12;
    const cardWidth = cols / itemsPerRow;

    breakpoints.forEach(bp => {
      const existingItems = newLayouts[bp] || [];
      const existingCount = existingItems.length;
      const row = Math.floor(existingCount / itemsPerRow);
      const col = existingCount % itemsPerRow;
      const x = col * cardWidth;
      const y = row * DEFAULT_LAYOUTS[bp].h;

      newLayouts[bp] = [
        ...existingItems,
        {
          i: id,
          x: x,
          y: y,
          w: cardWidth,
          h: DEFAULT_LAYOUTS[bp].h
        }
      ];
    });

    return newLayouts;
  }, [currentPreset]);

  const toggleWidget = useCallback((id: string, visible: boolean) => {
    let newLayouts = { ...layouts };
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
      
      {/* --- Header (Command Bar) --- */}
      <header className="sticky top-0 z-50 w-full mb-4 pt-4 px-6">
        <GlassPanel className="w-full h-20 flex items-center justify-between px-6 shadow-lg backdrop-blur-2xl">
          
          <div className="flex items-center gap-6">
            {/* Shop Selector */}
            <Select value={storeId} onValueChange={handleStoreChange}>
              <SelectTrigger className="w-[180px] border-none bg-transparent hover:bg-surface/10 text-text-primary focus:ring-0 transition-all rounded-lg h-9 font-medium shadow-none pl-2">
                <SelectValue placeholder="选择店铺" />
              </SelectTrigger>
              <SelectContent className="bg-surface/95 backdrop-blur-xl border-border/20 text-text-primary shadow-xl">
                {SHOP_OPTIONS.map(shop => (
                  <SelectItem key={shop.value} value={shop.value}>
                    {shop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Layout Preset Selector */}
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
            
            {/* Time Filter Tabs */}
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
        <div className="w-full">
          <ResponsiveGridLayout
            className={`layout ${isEditMode ? 'is-edit-mode' : ''}`}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 6, sm: 4, xs: 2, xxs: 2 }}
            rowHeight={40}
            dragConfig={{ enabled: isEditMode, handle: '.drag-handle' }}
            resizeConfig={{ enabled: isEditMode }}
            onLayoutChange={onLayoutChange}
            margin={[20, 20]}
          >
            {activeWidgets.map((widget) => (
              <div key={widget.id} className={isEditMode ? 'is-edit-mode' : ''}>
                <GlassPanel className={`h-full flex flex-col group transition-all duration-300 ${
                  isEditMode 
                  ? 'border-primary border-dashed bg-primary/5 ring-1 ring-primary/20 z-20' 
                  : 'hover:border-primary/30'
                }`}>
                  <CompassWidget
                    title={widget.title}
                    isEditMode={isEditMode}
                    hideHeader={widget.type === 'metric' && !isEditMode}
                    contentClassName={widget.type === 'metric' ? "p-0" : undefined}
                    onRemove={() => toggleWidget(widget.id, false)}
                    className="h-full bg-transparent p-0 shadow-none border-none"
                    headerClassName={`px-5 py-4 flex items-center justify-between border-b border-border/10 transition-colors ${
                      isEditMode ? 'drag-handle cursor-move bg-primary/5' : 'cursor-default'
                    }`}
                  >
                    <div className={`flex-1 h-full overflow-hidden relative select-none ${widget.type === 'metric' ? 'p-0' : 'p-5'}`}>
                      {widget.type === 'gauge' ? (
                        <div className="flex flex-col items-center justify-center h-full">
                           <ScoreGauge score={widget.data?.score ?? 0} label={widget.title} />
                        </div>
                      ) : widget.type === 'metric' ? (
                        <MetricCard
                          totalScore={widget.data?.totalScore ?? 0}
                          totalLabel={widget.data?.totalLabel ?? ''}
                          items={widget.data?.items ?? []}
                          onItemClick={() => {
                            const typeMap: Record<string, string> = {
                              'card-product': 'product',
                              'card-logistics': 'logistics',
                              'card-service': 'service',
                              'card-merchant': 'risk'
                            };
                            const type = typeMap[widget.id] || 'product';
                            router.push(`/metric-detail?type=${type}`);
                          }}
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