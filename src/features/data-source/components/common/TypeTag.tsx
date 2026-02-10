import React from 'react';
import { DataSourceType } from '../../services/types';
import { Server, Database, FileText, HelpCircle } from 'lucide-react';

interface TypeTagProps {
  type: DataSourceType;
}

export function TypeTag({ type }: TypeTagProps) {
  const config: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    DOUYIN_API: {
      icon: Server,
      label: '抖音API',
      className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    DOUYIN_SHOP: {
      icon: Server,
      label: '抖音小店',
      className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    DOUYIN_APP: {
      icon: Server,
      label: '抖音APP',
      className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    FILE_IMPORT: {
      icon: FileText,
      label: '文件导入',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    FILE_UPLOAD: {
      icon: FileText,
      label: '文件上传',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    SELF_HOSTED: {
      icon: Database,
      label: '自托管',
      className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
  };

  const { icon: Icon, label, className } = config[type] || config.DOUYIN_API;

  return (
    <div className={`p-2 rounded-lg inline-flex items-center justify-center ${className}`}>
      <Icon size={18} />
    </div>
  );
}
