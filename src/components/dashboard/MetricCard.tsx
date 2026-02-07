import React from 'react';
import { cn } from '@/app/components/ui/utils';

interface MetricItem {
  label: string;
  score: number;
  isWarning?: boolean;
}

interface MetricCardProps {
  totalScore: number;
  totalLabel: string;
  items: MetricItem[];
  className?: string;
}

export default function MetricCard({ totalScore, totalLabel, items, className }: MetricCardProps) {
  // 辅助函数：统一管理颜色逻辑
  const getColorConfig = (score: number) => {
    if (score >= 90) {
      return {
        // 翠绿 -> 青色
        gradient: "from-emerald-400 to-teal-500",
        shadow: "shadow-[0_0_10px_rgba(52,211,153,0.4)]",
        text: "text-emerald-500",
        ring: "border-emerald-500",
      };
    } else if (score >= 60) {
      return {
        // 琥珀 -> 橙色
        gradient: "from-amber-400 to-orange-500",
        shadow: "shadow-[0_0_10px_rgba(251,191,36,0.4)]",
        text: "text-amber-500",
        ring: "border-amber-500",
      };
    } else {
      return {
        // 玫瑰 -> 红色
        gradient: "from-rose-500 to-red-600",
        shadow: "shadow-[0_0_10px_rgba(244,63,94,0.4)]",
        text: "text-rose-500",
        ring: "border-rose-500",
      };
    }
  };

  const totalColor = getColorConfig(totalScore);

  // 修复点 1: 动态字号，防止 100 分过大
  const totalScoreSize = totalScore >= 100 ? "text-4xl" : "text-5xl";

  return (
    <div className={cn("flex flex-col h-full w-full bg-surface p-4 rounded-xl", className)}>
      {/* 顶部：总分展示区域 */}
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-border/40">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-1.5 opacity-80">
            {totalLabel}
          </span>
          
          {/* 渐变总分数字 */}
          <div className={cn(
            "font-bold font-mono tracking-tighter tabular-nums leading-none",
            "text-transparent bg-clip-text bg-gradient-to-br drop-shadow-sm filter",
            // 修复点 2: 增加 padding 防止 bg-clip-text 边缘被切
            "px-1 pb-1 -ml-1", 
            totalScoreSize,
            totalColor.gradient
          )}>
            {totalScore}
          </div>
        </div>

        {/* 动态装饰性图标 */}
        <div className="relative w-12 h-12 flex items-center justify-center mb-1 shrink-0">
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent border-t-current opacity-30 animate-[spin_4s_linear_infinite]",
            totalColor.text
          )} />
          <div className={cn(
            "absolute inset-0 rounded-full border-2 opacity-20",
            totalColor.ring
          )} />
          <div className={cn("text-sm font-black", totalColor.text)}>
            {totalScore >= 90 ? 'S' : totalScore >= 80 ? 'A' : totalScore >= 60 ? 'B' : 'C'}
          </div>
        </div>
      </div>

      {/* 列表：细分项 */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border/30">
        {items.map((item, index) => {
          const itemColor = getColorConfig(item.score);
          const isWarningState = item.isWarning || item.score < 60;

          return (
            <div key={index} className="group flex flex-col gap-1.5">
              <div className="flex justify-between items-end text-xs">
                <span className={cn(
                  "font-medium transition-colors duration-300 truncate pr-2",
                  isWarningState ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                )}>
                  {item.label}
                </span>
                
                {/* 修复点 3: 固定宽度的数字容器，确保对齐 */}
                <span className={cn(
                  "font-mono font-bold tabular-nums w-8 text-right shrink-0",
                  isWarningState ? "text-rose-500" : "text-text-primary"
                )}>
                  {item.score}
                </span>
              </div>
              
              {/* 进度条 */}
              <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden relative backdrop-blur-sm">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out relative",
                    "bg-gradient-to-r",
                    itemColor.gradient,
                    itemColor.shadow
                  )}
                  style={{ width: `${item.score}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/50 blur-[1px]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}