import React from 'react';
import { DataSource } from '../../services/types';
import { StatusTag } from '../common/StatusTag';
import { TypeTag } from '../common/TypeTag';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface DataSourceTableProps {
  data: DataSource[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function DataSourceTable({ data, loading, onEdit, onDelete }: DataSourceTableProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center w-full min-h-[400px] text-slate-500">
        加载中...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center w-full min-h-[400px] text-slate-500">
        未找到数据源。
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 dark:border-white/5">
            {['名称', '类型', '同步频率', '最后更新', '状态', '操作'].map((h) => (
              <th key={h} className="px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {data.map((source) => (
            <tr key={source.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <TypeTag type={source.type} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {source.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono capitalize">
                {source.type}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <RefreshCw size={12} className="text-slate-500" />
                  {source.frequency}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                {source.last_update ? format(new Date(source.last_update), 'yyyy-MM-dd HH:mm') : '-'}
              </td>
              <td className="px-6 py-4">
                <StatusTag status={source.status} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4 text-sm font-mono">
                  <button
                    onClick={() => router.push(`/data-source/${source.id}`)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline decoration-indigo-500/50 underline-offset-4"
                  >
                    查看
                  </button>
                  <button
                    onClick={() => onEdit(source.id)}
                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 hover:underline decoration-cyan-500/50 underline-offset-4"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => onDelete(source.id)}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 hover:underline decoration-rose-500/50 underline-offset-4"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
