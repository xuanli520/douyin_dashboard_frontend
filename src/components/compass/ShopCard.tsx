import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Radio, GripHorizontal, Package, Truck, HeadphonesIcon, Award } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

export interface ShopData {
  id: string;
  name: string;
  score: number;
  status: 'live' | 'offline' | 'warning' | 'critical';
  risk: number;
  trend: number[];
  serviceScore: number;
  productScore: number;
  logisticsScore: number;
  comprehensiveScore: number;
}

interface ShopCardProps extends React.HTMLAttributes<HTMLDivElement> {
  shop: ShopData;
  isEditing: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
}

// 四宫格单项组件
const GridItem = ({ 
  label, 
  score, 
  icon: Icon,
  colorIndex,
}: { 
  label: string; 
  score: number; 
  icon: React.ElementType;
  colorIndex: number;
}) => {
  // 根据索引获取固定颜色（橙色、蓝色、紫色、绿色）
  const getColorConfig = (index: number) => {
    const configs = [
      { bg: 'bg-orange-400', lightBg: 'bg-orange-100', text: 'text-orange-500', shadow: 'shadow-orange-200' },
      { bg: 'bg-sky-400', lightBg: 'bg-sky-100', text: 'text-sky-500', shadow: 'shadow-sky-200' },
      { bg: 'bg-purple-400', lightBg: 'bg-purple-100', text: 'text-purple-500', shadow: 'shadow-purple-200' },
      { bg: 'bg-emerald-400', lightBg: 'bg-emerald-100', text: 'text-emerald-500', shadow: 'shadow-emerald-200' },
    ];
    return configs[index % 4];
  };

  const config = getColorConfig(colorIndex);

  return (
    <div className="flex flex-col items-start justify-start p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/30 hover:shadow-lg transition-all duration-200">
      {/* 圆形图标 */}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg",
        config.bg
      )}>
        <Icon size={24} className="text-white" />
      </div>
      
      {/* 指标名称 */}
      <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </span>
      
      {/* 得分 */}
      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {score}
      </span>
    </div>
  );
};

const ShopCard = forwardRef<HTMLDivElement, ShopCardProps>(
  ({ shop, style, className, onMouseDown, onMouseUp, onTouchEnd, isEditing, onClick, ...props }, ref) => {
    const isHealthy = shop.score >= 90;
    const isRisk = shop.risk > 0 || shop.score < 60;
    
    const StatusIcon = shop.status === 'live' ? Zap : shop.status === 'warning' ? AlertTriangle : Radio;

    // 四宫格数据 - 从左到右，从上到下：商品体验、物流体验、服务体验、差行为
    const gridItems = [
      { label: '商品体验', score: shop.productScore, icon: Package },
      { label: '物流体验', score: shop.logisticsScore, icon: Truck },
      { label: '服务体验', score: shop.serviceScore, icon: HeadphonesIcon },
      { label: '差行为', score: shop.risk, icon: AlertTriangle },
    ];

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "flex flex-col relative group overflow-hidden rounded-xl border transition-all duration-300",
          "dark:bg-slate-900/60 dark:backdrop-blur-md dark:border-slate-700/50 dark:hover:bg-slate-800/50",
          isHealthy && "dark:border-cyan-500/30 dark:shadow-[0_0_15px_rgba(6,182,212,0.1)]",
          isRisk && "dark:border-red-500/30 dark:shadow-[0_0_15px_rgba(239,68,68,0.1)]",
          "bg-white border-slate-200 shadow-sm hover:shadow-md",
          className
        )}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        onClick={!isEditing ? onClick : undefined}
        {...props}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3 border-b transition-colors select-none",
          "dark:border-white/5 border-slate-100",
          isEditing ? "drag-handle cursor-move bg-primary/5" : "cursor-default"
        )}>
          <div className="flex items-center gap-2 overflow-hidden">
             {isEditing && <GripHorizontal size={14} className="text-slate-400 shrink-0" />}
             <div className={`p-1.5 rounded-md shrink-0 ${
               isRisk 
                 ? 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400' 
                 : 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400'
             }`}>
                <StatusIcon size={14} />
             </div>
             <span className="font-semibold text-sm tracking-wide text-slate-700 dark:text-slate-100 truncate">
               {shop.name}
             </span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {shop.status === 'live' && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            )}
            <span className={`text-[10px] font-medium ${isRisk ? 'text-red-500 dark:text-red-400' : 'text-slate-400'}`}>
              {shop.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Body - 四宫格布局 */}
        <div className="flex-1 p-3 relative z-10 min-h-0 bg-slate-50/50 dark:bg-slate-900/30">
          {/* 2x2 网格 */}
          <div className="grid grid-cols-2 gap-3 h-full">
            {gridItems.map((item, index) => (
              <GridItem
                key={index}
                label={item.label}
                score={item.score}
                icon={item.icon}
                colorIndex={index}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ShopCard.displayName = 'ShopCard';

export default ShopCard;
