import React from 'react';
import { DataSourceStatus } from '../../services/types';
import { Badge } from '@/app/components/ui/badge';

interface StatusTagProps {
  status: DataSourceStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        ACTIVE
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono rounded border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
        ERROR
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs font-mono rounded border border-slate-500/20">
      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
      INACTIVE
    </span>
  );
}
