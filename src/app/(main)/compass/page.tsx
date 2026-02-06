'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Responsive } from 'react-grid-layout';
import { WidthProvider } from '@/components/dashboard/WidthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Sun, Moon, RotateCcw, LayoutTemplate } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import ShopCard from '@/components/compass/ShopCard';
import { MOCK_SHOPS } from '@/data/shops';
import LayoutCustomizer from '@/components/dashboard/LayoutCustomizer';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

// Import RGL styles
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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

// 使用 WidthProvider 包装 Responsive 组件以支持 v2 API
const ResponsiveGridLayout = WidthProvider(Responsive);

// --- 布局预设数据 (Layout Presets) - 每行显示数量 ---
const LAYOUT_PRESETS: Record<string, any> = {
  '2': {
    lg: [
      { i: 'c1', x: 0, y: 0, w: 6, h: 6 },
      { i: 'c2', x: 6, y: 0, w: 6, h: 6 },
      { i: 'c3', x: 0, y: 6, w: 6, h: 6 },
      { i: 'c4', x: 6, y: 6, w: 6, h: 6 },
    ],
    md: [
      { i: 'c1', x: 0, y: 0, w: 5, h: 6 },
      { i: 'c2', x: 5, y: 0, w: 5, h: 6 },
      { i: 'c3', x: 0, y: 6, w: 5, h: 6 },
      { i: 'c4', x: 5, y: 6, w: 5, h: 6 },
    ],
    sm: [
      { i: 'c1', x: 0, y: 0, w: 6, h: 6 },
      { i: 'c2', x: 0, y: 6, w: 6, h: 6 },
      { i: 'c3', x: 0, y: 12, w: 6, h: 6 },
      { i: 'c4', x: 0, y: 18, w: 6, h: 6 },
    ]
  },
  '3': {
    lg: [
      { i: 'c1', x: 0, y: 0, w: 4, h: 6 },
      { i: 'c2', x: 4, y: 0, w: 4, h: 6 },
      { i: 'c3', x: 8, y: 0, w: 4, h: 6 },
      { i: 'c4', x: 0, y: 6, w: 4, h: 6 },
    ],
    md: [
      { i: 'c1', x: 0, y: 0, w: 4, h: 6 },
      { i: 'c2', x: 4, y: 0, w: 4, h: 6 },
      { i: 'c3', x: 8, y: 0, w: 4, h: 6 },
      { i: 'c4', x: 0, y: 6, w: 4, h: 6 },
    ],
    sm: [
      { i: 'c1', x: 0, y: 0, w: 6, h: 6 },
      { i: 'c2', x: 0, y: 6, w: 6, h: 6 },
      { i: 'c3', x: 0, y: 12, w: 6, h: 6 },
      { i: 'c4', x: 0, y: 18, w: 6, h: 6 },
    ]
  },
  '4': {
    lg: [
      { i: 'c1', x: 0, y: 0, w: 3, h: 6 },
      { i: 'c2', x: 3, y: 0, w: 3, h: 6 },
      { i: 'c3', x: 6, y: 0, w: 3, h: 6 },
      { i: 'c4', x: 9, y: 0, w: 3, h: 6 },
      { i: 'c5', x: 0, y: 6, w: 3, h: 6 },
      { i: 'c6', x: 3, y: 6, w: 3, h: 6 },
      { i: 'c7', x: 6, y: 6, w: 3, h: 6 },
      { i: 'c8', x: 9, y: 6, w: 3, h: 6 },
    ],
    md: [
      { i: 'c1', x: 0, y: 0, w: 3, h: 6 },
      { i: 'c2', x: 3, y: 0, w: 3, h: 6 },
      { i: 'c3', x: 6, y: 0, w: 3, h: 6 },
      { i: 'c4', x: 9, y: 0, w: 3, h: 6 },
      { i: 'c5', x: 0, y: 6, w: 3, h: 6 },
      { i: 'c6', x: 3, y: 6, w: 3, h: 6 },
      { i: 'c7', x: 6, y: 6, w: 3, h: 6 },
      { i: 'c8', x: 9, y: 6, w: 3, h: 6 },
    ],
    sm: [
      { i: 'c1', x: 0, y: 0, w: 6, h: 6 },
      { i: 'c2', x: 0, y: 6, w: 6, h: 6 },
      { i: 'c3', x: 0, y: 12, w: 6, h: 6 },
      { i: 'c4', x: 0, y: 18, w: 6, h: 6 },
    ]
  }
};

const DEFAULT_CARD_SIZE = { w: 4, h: 6 }; // Default size for new cards

export default function CompassPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [layouts, setLayouts] = useState(LAYOUT_PRESETS['3']);
  const [currentPreset, setCurrentPreset] = useState('3');
  
  // Visibility State
  const [visibleShops, setVisibleShops] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(MOCK_SHOPS).forEach(key => initial[key] = true);
    return initial;
  });

  // Load from LocalStorage
  useEffect(() => {
    setMounted(true);
    const savedLayouts = localStorage.getItem('compass-layouts');
    const savedVisibility = localStorage.getItem('compass-visibility');
    const savedPreset = localStorage.getItem('compass-preset');

    if (savedLayouts) {
      try {
        const parsedLayouts = JSON.parse(savedLayouts);
        setLayouts(parsedLayouts);

        // 根据布局中的卡片数量推断 preset
        const firstBreakpoint = Object.keys(parsedLayouts)[0] as keyof typeof parsedLayouts;
        const cardCount = parsedLayouts[firstBreakpoint]?.[0]?.w || 0;
        if (cardCount === 6) setCurrentPreset('2');
        else if (cardCount === 4) setCurrentPreset('3');
        else if (cardCount === 3) setCurrentPreset('4');
      } catch (e) { console.error(e); }
    }
    // 单独保存的 preset 优先级更高
    if (savedPreset && ['2', '3', '4'].includes(savedPreset)) {
      setCurrentPreset(savedPreset);
    }
    if (savedVisibility) {
      try { setVisibleShops(JSON.parse(savedVisibility)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save to LocalStorage
  const onLayoutChange = useCallback((currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    if (mounted) {
       localStorage.setItem('compass-layouts', JSON.stringify(allLayouts));
    }
  }, [mounted]);

  // 处理预设切换
  const handlePresetChange = (value: string) => {
    setCurrentPreset(value);
    localStorage.setItem('compass-preset', value);
    const newLayout = LAYOUT_PRESETS[value];
    if (newLayout) {
      setLayouts(newLayout);
      localStorage.setItem('compass-layouts', JSON.stringify(newLayout));
    }
  };

  const navigateToCompass = (shopId: string) => {
    router.push(`/dashboard?storeId=${shopId}`);
  };

  // Add layout for a shop if it doesn't exist in current breakpoint
  const addShopLayout = useCallback((id: string, currentLayouts: any) => {
    const newLayouts = { ...currentLayouts };
    // 每行显示数量（根据当前预设计算）
    const itemsPerRow = parseInt(currentPreset) || 3;
    const cols = 12;
    const cardWidth = cols / itemsPerRow; // 每张卡片占用的列数

    // Simple logic: add to end of list for each breakpoint if missing
    ['lg', 'md', 'sm'].forEach(bp => {
       if (!newLayouts[bp]) newLayouts[bp] = [];
       const exists = newLayouts[bp].find((l: any) => l.i === id);
       if (!exists) {
         // 计算从左到右的位置
         const existingItems = newLayouts[bp];
         const existingCount = existingItems.length;
         const row = Math.floor(existingCount / itemsPerRow);
         const col = existingCount % itemsPerRow;
         const x = col * cardWidth;
         const y = row * DEFAULT_CARD_SIZE.h;

         newLayouts[bp] = [
           ...newLayouts[bp],
           {
             i: id,
             x: x,
             y: y,
             w: cardWidth,
             h: DEFAULT_CARD_SIZE.h
           }
         ];
       }
    });
    return newLayouts;
  }, [currentPreset]);

  const toggleShop = useCallback((id: string, visible: boolean) => {
    let newLayouts = { ...layouts };
    
    if (visible) {
       // Check if layout exists for this shop in current breakpoint (e.g. lg)
       // If not, add default layout
       const hasLayout = layouts.lg?.some((l: any) => l.i === id);
       if (!hasLayout) {
          newLayouts = addShopLayout(id, layouts);
          setLayouts(newLayouts);
          localStorage.setItem('compass-layouts', JSON.stringify(newLayouts));
       }
    }

    const newVisibility = { ...visibleShops, [id]: visible };
    setVisibleShops(newVisibility);
    localStorage.setItem('compass-visibility', JSON.stringify(newVisibility));
  }, [layouts, visibleShops, addShopLayout]);

  // Early return if not mounted (client-side only for RGL)
  if (!mounted) return <div className="min-h-screen bg-canvas" />;

  const activeShops = Object.keys(MOCK_SHOPS).filter(key => visibleShops[key]);

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-sans overflow-hidden relative transition-colors duration-500">
      
      {/* --- Header (Command Bar) --- */}
      <header className="sticky top-0 z-50 w-full mb-4 pt-4 px-6">
        <GlassPanel className="w-full h-20 flex items-center justify-between px-6 shadow-lg backdrop-blur-2xl">
          
          <div className="flex items-center gap-6">
            {/* Layout Preset Selector */}
            <Select value={currentPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-[140px] border-none bg-transparent hover:bg-surface/10 text-text-muted hover:text-text-primary focus:ring-0 transition-all rounded-lg h-9 text-xs font-medium shadow-none pl-2 flex gap-2">
                 <LayoutTemplate size={14} />
                 <SelectValue placeholder="布局" />
              </SelectTrigger>
              <SelectContent className="bg-surface/95 backdrop-blur-xl border-border/20 text-text-primary shadow-xl">
                <SelectItem value="2">每行 2 个</SelectItem>
                <SelectItem value="3">每行 3 个</SelectItem>
                <SelectItem value="4">每行 4 个</SelectItem>
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
                  items={Object.values(MOCK_SHOPS).map(shop => ({ 
                    i: shop.id, 
                    title: shop.name, 
                    visible: !!visibleShops[shop.id] 
                  }))}
                  onToggle={toggleShop}
                />

                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-9 h-9 rounded-full transition-all relative ${
                     isEditing 
                     ? "bg-primary text-white shadow-[0_0_12px_theme(colors.primary)] hover:bg-primary/90" 
                     : "text-text-secondary hover:text-primary hover:bg-primary/10"
                  }`}
                  title={isEditing ? "Finish Editing" : "Edit Layout"}
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

      {/* Grid Canvas */}
      <main className="p-6 pt-0 relative z-10 min-h-[calc(100vh-110px)] overflow-y-auto overflow-x-hidden scrollbar-none">
         <ResponsiveGridLayout
            className={`layout ${isEditing ? 'is-edit-mode' : ''}`}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            // --- v2 API: 使用 dragConfig/resizeConfig 对象式 API ---
            dragConfig={{ enabled: isEditing, handle: '.drag-handle' }}
            resizeConfig={{ enabled: isEditing }}
            onLayoutChange={onLayoutChange}
            margin={[20, 20]}
            containerPadding={[0, 0]}
         >
            {activeShops.map((key) => {
               const shop = MOCK_SHOPS[key];
               return (
                 <div key={key} className={isEditing ? 'is-edit-mode' : ''}>
                    {/* 卡片容器 */}
                    <GlassPanel className={`h-full flex flex-col group transition-all duration-300 ${
                        isEditing
                        ? 'border-primary border-dashed bg-primary/5 ring-1 ring-primary/20 z-20'
                        : 'hover:border-primary/30'
                    }`}>
                      <ShopCard
                        shop={shop}
                        isEditing={isEditing}
                        onClick={() => navigateToCompass(shop.id)}
                        className="h-full w-full bg-transparent shadow-none border-none"
                        // Pass props to override internal styles if needed, but ShopCard handles it
                      />
                    </GlassPanel>
                 </div>
               );
            })}
         </ResponsiveGridLayout>
      </main>

    </div>
  );
}
