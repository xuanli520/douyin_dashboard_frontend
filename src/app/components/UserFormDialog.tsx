'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import type { User, UserCreate, UserUpdate } from '@/types/user';

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserCreate | UserUpdate) => Promise<void>;
  user?: User | null;
  mode: 'create' | 'edit' | 'permissions';
}

export function UserFormDialog({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode,
}: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    is_active: user?.is_active ?? true,
    is_superuser: user?.is_superuser ?? false,
    is_verified: user?.is_verified ?? false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const submitData: UserCreate | UserUpdate =
        mode === 'create'
          ? {
              username: formData.username,
              email: formData.email,
              password: formData.password,
            }
          : {
              username: formData.username,
              email: formData.email,
              is_active: formData.is_active,
              is_superuser: formData.is_superuser,
              is_verified: formData.is_verified,
            };

      await onSubmit(submitData);
      onClose();
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const title =
    mode === 'create' ? '创建用户' : mode === 'edit' ? '编辑用户' : '权限配置';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-lg max-h-[90vh] flex flex-col p-0 border border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            {user && mode !== 'create' && (
              <p className="text-xs text-slate-500 font-mono">
                User ID: {user.id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 用户名 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              用户名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              disabled={mode === 'permissions'}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm text-slate-700 dark:text-slate-200 disabled:opacity-50"
              placeholder="请输入用户名"
            />
          </div>

          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              邮箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={mode === 'permissions'}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm text-slate-700 dark:text-slate-200 disabled:opacity-50"
              placeholder="请输入邮箱"
            />
          </div>

          {/* 密码 - 仅创建时显示 */}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={8}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm text-slate-700 dark:text-slate-200"
                placeholder="请输入密码（至少8位）"
              />
            </div>
          )}

          {/* 权限设置 - 编辑和权限模式显示 */}
          {mode !== 'create' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                权限设置
              </h3>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 text-cyan-600 focus:ring-offset-0 focus:ring-0"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm text-slate-600 dark:text-slate-300"
                >
                  账户已激活
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_superuser"
                  checked={formData.is_superuser}
                  onChange={(e) =>
                    setFormData({ ...formData, is_superuser: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 text-cyan-600 focus:ring-offset-0 focus:ring-0"
                />
                <label
                  htmlFor="is_superuser"
                  className="text-sm text-slate-600 dark:text-slate-300"
                >
                  超级管理员权限
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_verified"
                  checked={formData.is_verified}
                  onChange={(e) =>
                    setFormData({ ...formData, is_verified: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 text-cyan-600 focus:ring-offset-0 focus:ring-0"
                />
                <label
                  htmlFor="is_verified"
                  className="text-sm text-slate-600 dark:text-slate-300"
                >
                  邮箱已验证
                </label>
              </div>
            </div>
          )}
        </form>

        <div className="px-6 py-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3 bg-slate-50 dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 text-white rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.2)] font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? '处理中...' : mode === 'create' ? '创建' : '保存'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
