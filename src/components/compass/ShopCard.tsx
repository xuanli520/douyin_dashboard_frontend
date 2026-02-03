import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Zap, Radio, GripHorizontal } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/app/components/ui/utils';

export interface ShopData {
  id: string;
  name: string;
  score: number;
  status: 'live' | 'offline' | 'warning' | 'critical';
  risk: number; // > 0 means risk
  trend: number[]; // Array of numbers for sparkline
}

interface ShopCardProps extends React.HTMLAttributes<HTMLDivElement> {
  shop: ShopData;
  isEditing: boolean;
  onClick?: () => void;
  // React-grid-layout props
  style?: React.CSSProperties;
  className?: string;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
}

// Sparkline Component
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const chartData = data.map((val, i) => ({ i, val }));
  return (
    <div className="h-10 w-full opacity-70">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ShopCard = forwardRef<HTMLDivElement, ShopCardProps>(
  ({ shop, style, className, onMouseDown, onMouseUp, onTouchEnd, isEditing, onClick, ...props }, ref) => {
    // Determine Color Theme based on status/score
    const isHealthy = shop.score >= 90;
    const isRisk = shop.risk > 0 || shop.score < 60;
    
    // Status Indicator
    const StatusIcon = shop.status === 'live' ? Zap : shop.status === 'warning' ? AlertTriangle : Radio;
    
    // Colors for Sparkline
    const accentColor = isHealthy ? '#06b6d4' : isRisk ? '#ef4444' : '#94a3b8';

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "flex flex-col relative group overflow-hidden rounded-xl border transition-all duration-300",
          // Dark Mode
          "dark:bg-slate-900/60 dark:backdrop-blur-md dark:border-slate-700/50 dark:hover:bg-slate-800/50",
          isHealthy && "dark:border-cyan-500/30 dark:shadow-[0_0_15px_rgba(6,182,212,0.1)]",
          isRisk && "dark:border-red-500/30 dark:shadow-[0_0_15px_rgba(239,68,68,0.1)]",
          // Light Mode
          "bg-white border-slate-200 shadow-sm hover:shadow-md",
          className
        )}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        onClick={!isEditing ? onClick : undefined}
        {...props}
      >
        {/* Header - drag-handle class for react-grid-layout (only in edit mode) */}
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
             {/* Title: Matching CompassWidget font style */}
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

        {/* Body */}
        <div className="flex-1 p-4 flex flex-col justify-between relative z-10 min-h-0">
          <div className="flex items-end justify-between mb-4">
             <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">Health Score</span>
                <div className="flex items-baseline gap-1">
                   <span className={cn(
                     "text-3xl font-bold font-mono",
                     isHealthy ? "text-cyan-600 dark:text-cyan-400 dark:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" : 
                     isRisk ? "text-red-600 dark:text-red-400 dark:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" : 
                     "text-slate-700 dark:text-slate-200"
                   )}>
                     {shop.score}
                   </span>
                   <span className="text-sm text-slate-400">/100</span>
                </div>
             </div>
             
             {/* Risk Badge */}
             {shop.risk > 0 && (
               <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                 <AlertTriangle size={12} className="text-red-500 dark:text-red-400" />
                 <span className="text-xs text-red-600 dark:text-red-300 font-mono">RISK</span>
               </div>
             )}
          </div>

          {/* Sparkline */}
          <div className="mt-auto">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-400 uppercase">7-Day Trend</span>
                <Activity size={12} className="text-slate-400" />
             </div>
             <Sparkline data={shop.trend} color={accentColor} />
          </div>
        </div>
      </div>
    );
  }
);

ShopCard.displayName = 'ShopCard';

export default ShopCard;
