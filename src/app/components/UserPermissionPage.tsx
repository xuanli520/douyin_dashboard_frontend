'use client';

import { useState, useEffect } from 'react';
import { Search, X, Users, Shield, Check, MoreVertical, Loader2 } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';
import { UserFormDialog } from './UserFormDialog';
import { useUserStore } from '@/stores/userStore';
import type { User, UserCreate, UserUpdate } from '@/types/user';

// 模拟用户数据
const mockUsers: User[] = [
  { id: 1, username: 'Alex Chen', email: 'alex@tech.co', is_active: true, is_superuser: true, is_verified: true },
  { id: 2, username: 'Sarah Wu', email: 'sarah@ops.co', is_active: true, is_superuser: false, is_verified: true },
  { id: 3, username: 'Mike Ross', email: 'mike@data.co', is_active: true, is_superuser: false, is_verified: true },
  { id: 4, username: 'Jenny Lin', email: 'jenny@data.co', is_active: true, is_superuser: false, is_verified: true },
  { id: 5, username: 'David Kim', email: 'david@ops.co', is_active: true, is_superuser: false, is_verified: true },
  { id: 6, username: 'Tom Hardy', email: 'tom@ops.co', is_active: true, is_superuser: false, is_verified: true },
  { id: 7, username: 'Guest User', email: 'guest@temp.co', is_active: false, is_superuser: false, is_verified: false },
];

export default function UserPermissionPage() {
  const {
    users,
    currentUser,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  } = useUserStore();

  const [searchText, setSearchText] = useState('');
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'permissions'>('edit');
  const [useMockData, setUseMockData] = useState(true);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    try {
      await fetchUsers();
      setUseMockData(false);
    } catch {
      setUseMockData(true);
    }
  };

  const displayUsers = useMockData ? mockUsers : users;

  const filteredUsers = displayUsers.filter(
    (user) =>
      (user.username?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  const handleEdit = (user: User) => {
    if (!user?.id) {
      console.error('用户缺少 ID:', user);
      return;
    }
    setSelectedUser(user);
    setDialogMode('edit');
    setShowFormDialog(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setDialogMode('create');
    setShowFormDialog(true);
  };

  const handleFormSubmit = async (data: UserCreate | UserUpdate) => {
    clearError();
    if (dialogMode === 'create') {
      await createUser(data as UserCreate);
    } else if (selectedUser?.id) {
      await updateUser(selectedUser.id, data as UserUpdate);
    }
  };

  const handleDelete = async (user: User) => {
    if (!user?.id) return;
    if (confirm(`确定要删除用户 "${user.username || '未知用户'}" 吗？`)) {
      await deleteUser(user.id);
    }
  };

  const getRoleLabel = (user: User): string => {
    if (user?.is_superuser) return '管理员 (Admin)';
    return '用户 (User)';
  };

  const isSuperuser = currentUser?.is_superuser ?? false;

  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 relative">
      <GlassCard className="min-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <NeonTitle icon={Users}>用户权限管理 (IAM)</NeonTitle>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 w-[300px] bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm text-slate-700 dark:text-slate-200 transition-all"
              />
            </div>

            {isSuperuser && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/50 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] text-sm font-medium"
              >
                新增用户
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="hover:text-red-800 dark:hover:text-red-300">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-500" size={32} />
          </div>
        )}

        {/* User Table */}
        {!isLoading && (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-cyan-500 focus:ring-offset-0 focus:ring-0"
                    />
                  </th>
                  {['用户 (User)', '邮箱 (Email)', '角色 (Role)', '状态 (Status)', '操作 (Action)'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-cyan-500 focus:ring-offset-0 focus:ring-0"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:border-cyan-500/50 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {user.username || '未知用户'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                      {user.email || '无邮箱'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Shield size={12} className="text-indigo-400" />
                        {getRoleLabel(user)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${
                          user.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.is_active ? 'bg-emerald-500' : 'bg-slate-500'
                          }`}
                        />
                        {user.is_active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {isSuperuser && user.id && (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-mono underline decoration-cyan-500/30 underline-offset-4"
                            >
                              EDIT_PERMS
                            </button>
                            {currentUser?.id !== user.id && (
                              <button
                                onClick={() => handleDelete(user)}
                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-mono underline decoration-red-500/30 underline-offset-4"
                              >
                                DELETE
                              </button>
                            )}
                          </>
                        )}
                        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Users size={48} className="mb-4 opacity-50" />
                <p>暂无用户数据</p>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* User Form Dialog */}
      <UserFormDialog
        isOpen={showFormDialog}
        onClose={() => setShowFormDialog(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        mode={dialogMode}
      />
    </div>
  );
}
