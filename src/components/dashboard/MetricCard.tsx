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
  onItemClick?: (item: MetricItem) => void;
}

export default function MetricCard({ totalScore, totalLabel, items, className, onItemClick }: MetricCardProps) {
  // 颜色逻辑保持不变
  const getStatusColor = (score: number) => {
    if (score >= 90) return { bar: "bg-blue-500", text: "text-blue-600", badge: "bg-blue-50 text-blue-600" };
    if (score >= 60) return { bar: "bg-amber-500", text: "text-amber-600", badge: "bg-amber-50 text-amber-600" };
    return { bar: "bg-red-500", text: "text-red-600", badge: "bg-red-50 text-red-600" };
  };

  const status = getStatusColor(totalScore);

  return (
    // 关键修改：这里完全复刻了 IndicatorDetailPage 的外层样式
    // bg-white rounded-lg shadow-sm p-6
    <div className={cn(
      "flex flex-col h-full w-full bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md", 
      className
    )}>
      {/* 头部区域 */}
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-start mb-2">
           <h2 className="text-lg font-medium text-gray-900">{totalLabel}得分</h2>
           {/* 可选：右上角状态标签 */}
           {/* <span className={cn("text-xs px-2 py-0.5 rounded font-medium", status.badge)}>
             {totalScore >= 90 ? '优秀' : totalScore >= 60 ? '一般' : '较差'}
           </span> */}
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-semibold text-gray-900">
            {totalScore}
          </span>
          <span className="text-gray-500">分</span>
        </div>

        <div className="text-sm text-gray-500 mt-2">较前1日 持平</div>
      </div>

      {/* 列表区域 */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item, index) => {
          const itemStatus = getStatusColor(item.score);
          const isWarning = item.score < 60 || item.isWarning;

          return (
            <div 
              key={index} 
              onClick={() => onItemClick?.(item)}
              className={cn(
                "group flex flex-col gap-1.5",
                onItemClick ? "cursor-pointer" : ""
              )}
            >
              <div className="flex justify-between items-end text-sm">
                <span className={cn(
                  "truncate pr-2 transition-colors",
                  isWarning ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900"
                )}>
                  {item.label}
                </span>
                
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "font-semibold tabular-nums",
                    isWarning ? "text-red-600" : "text-gray-900"
                  )}>
                    {item.score}
                  </span>
                  <span className="text-xs text-gray-400 scale-90">分</span>
                </div>
              </div>
              
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    itemStatus.bar
                  )}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}