import React from 'react';
import { DataSourceType } from '../../services/types';
import { Server, Database, FileText, HelpCircle } from 'lucide-react';

interface TypeTagProps {
  type: DataSourceType;
}

export function TypeTag({ type }: TypeTagProps) {
  const config: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    douyin_api: {
      icon: Server,
      label: '抖音API',
      className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    database: {
      icon: Database,
      label: 'Database',
      className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    file_upload: {
      icon: FileText,
      label: 'File',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    webhook: {
      icon: Server,
      label: 'Webhook',
      className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  };

  const { icon: Icon, label, className } = config[type] || config.douyin_api;

  return (
    <div className={`p-2 rounded-lg inline-flex items-center justify-center ${className}`}>
      <Icon size={18} />
    </div>
  );
}
