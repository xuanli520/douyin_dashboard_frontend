import React from 'react';
import { ScheduleType } from '../../services/types';
import { Clock, Timer, Calendar } from 'lucide-react';

interface ScheduleDisplayProps {
  type: ScheduleType;
  value: string;
}

export function ScheduleDisplay({ type, value }: ScheduleDisplayProps) {
  if (type === 'cron') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground" title="Cron 表达式">
        <Clock size={14} />
        <span className="font-mono bg-muted px-1 rounded">{value}</span>
      </div>
    );
  }

  if (type === 'interval') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground" title="间隔（秒）">
        <Timer size={14} />
        <span>每 {value} 秒</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" title="仅运行一次">
      <Calendar size={14} />
      <span>仅一次</span>
    </div>
  );
}
