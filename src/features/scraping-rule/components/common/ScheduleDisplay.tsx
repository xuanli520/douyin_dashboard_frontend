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
      <div className="flex items-center gap-2 text-xs text-muted-foreground" title="Cron Expression">
        <Clock size={14} />
        <span className="font-mono bg-muted px-1 rounded">{value}</span>
      </div>
    );
  }

  if (type === 'interval') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground" title="Interval (seconds)">
        <Timer size={14} />
        <span>Every {value}s</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" title="Run Once">
      <Calendar size={14} />
      <span>Once</span>
    </div>
  );
}
