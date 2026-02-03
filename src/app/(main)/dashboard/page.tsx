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
      { i: 'gauge-merchant', x: 0, y: 0, w: 3, h: 4 },
      { i: 'gauge-product', x: 3, y: 0, w: 3, h: 4 },
      { i: 'card-merchant', x: 0, y: 4, w: 3, h: 6 },
      { i: 'card-product', x: 3, y: 4, w: 3, h: 6 },
      { i: 'card-logistics', x: 6, y: 0, w: 3, h: 10 },
      { i: 'card-service', x: 9, y: 0, w: 3, h: 10 },
    ],
    md: [
      { i: 'gauge-merchant', x: 0, y: 0, w: 3, h: 4 },
      { i: 'gauge-product', x: 3, y: 0, w: 3, h: 4 },
      { i: 'card-merchant', x: 0, y: 4, w: 6, h: 6 },
      { i: 'card-product', x: 0, y: 10, w: 6, h: 6 },
      { i: 'card-logistics', x: 0, y: 16, w: 6, h: 8 },
      { i: 'card-service', x: 0, y: 24, w: 6, h: 8 },
    ]
  },
  focus: { // 聚焦模式：上方两个大指标，下方详细卡片平铺
    lg: [
      { i: 'gauge-merchant', x: 0, y: 0, w: 6, h: 4 },
      { i: 'gauge-product', x: 6, y: 0, w: 6, h: 4 },
      { i: 'card-merchant', x: 0, y: 4, w: 3, h: 8 },
      { i: 'card-product', x: 3, y: 4, w: 3, h: 8 },
      { i: 'card-logistics', x: 6, y: 4, w: 3, h: 8 },
      { i: 'card-service', x: 9, y: 4, w: 3, h: 8 },
    ],
    md: [
      { i: 'gauge-merchant', x: 0, y: 0, w: 6, h: 4 },
      { i: 'gauge-product', x: 0, y: 4, w: 6, h: 4 },
      { i: 'card-merchant', x: 0, y: 8, w: 6, h: 6 },
      { i: 'card-product', x: 0, y: 14, w: 6, h: 6 },
      { i: 'card-logistics', x: 0, y: 20, w: 6, h: 6 },
      { i: 'card-service', x: 0, y: 26, w: 6, h: 6 },
    ]
  },
  grid: { // 网格模式：均匀分布
    lg: [
      { i: 'gauge-merchant', x: 0, y: 0, w: 4, h: 5 },
      { i: 'gauge-product', x: 4, y: 0, w: 4, h: 5 },
      { i: 'card-service', x: 8, y: 0, w: 4, h: 5 }, // 把一个卡片提上来
      { i: 'card-merchant', x: 0, y: 5, w: 4, h: 7 },
      { i: 'card-product', x: 4, y: 5, w: 4, h: 7 },
      { i: 'card-logistics', x: 8, y: 5, w: 4, h: 7 },
    ],
    md: [
      { i: 'gauge-merchant', x: 0, y: 0, w: 3, h: 4 },
      { i: 'gauge-product', x: 3, y: 0, w: 3, h: 4 },
      { i: 'card-merchant', x: 0, y: 4, w: 3, h: 8 },
      { i: 'card-product', x: 3, y: 4, w: 3, h: 8 },
      { i: 'card-logistics', x: 0, y: 12, w: 3, h: 8 },
      { i: 'card-service', x: 3, y: 12, w: 3, h: 8 },
    ]
  }
};

const WIDGETS = [
  { id: 'gauge-merchant', title: '商家体验分', type: 'gauge', data: { score: 100 } },
  { id: 'gauge-product', title: '商品体验分', type: 'gauge', data: { score: 99 } },
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

  const toggleWidget = useCallback((id: string, visible: boolean) => {
    const newVisibility = { ...visibleWidgets, [id]: visible };
    setVisibleWidgets(newVisibility);
    localStorage.setItem('compass_visibility', JSON.stringify(newVisibility));
  }, [visibleWidgets]);

  if (!mounted) return <div className="min-h-screen bg-canvas" />;

  const activeWidgets = WIDGETS.filter(w => visibleWidgets[w.id]);

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-sans selection:bg-primary selection:text-white overflow-hidden relative transition-colors duration-500">
      
      {/* --- Header (Command Bar) --- */}
      <header className="sticky top-0 z-50 w-full mb-4 pt-4 px-6">
        <GlassPanel className="w-full h-20 flex items-center justify-between px-6 shadow-lg backdrop-blur-2xl">
          
          <div className="flex items-center gap-6">
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
                 <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent className="bg-surface/95 backdrop-blur-xl border-border/20 text-text-primary shadow-xl">
                <SelectItem value="standard">Standard View</SelectItem>
                <SelectItem value="focus">Focus Mode</SelectItem>
                <SelectItem value="grid">Grid Layout</SelectItem>
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
        <div className="w-full">
          <ResponsiveGridLayout
            className={`layout ${isEditMode ? 'is-edit-mode' : ''}`}
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
              <div key={widget.id} className={isEditMode ? 'is-edit-mode' : ''}>
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