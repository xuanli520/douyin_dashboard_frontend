'use client';

import { useState } from 'react';
import { Search, X, Users, Shield, Check, MoreVertical } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';

const users = [
  { id: 1, name: 'Alex Chen', email: 'alex@tech.co', role: '管理员 (Admin)', status: '已激活' },
  { id: 2, name: 'Sarah Wu', email: 'sarah@ops.co', role: '运营 (Ops)', status: '已激活' },
  { id: 3, name: 'Mike Ross', email: 'mike@data.co', role: '分析师 (Analyst)', status: '已激活' },
  { id: 4, name: 'Jenny Lin', email: 'jenny@data.co', role: '分析师 (Analyst)', status: '已激活' },
  { id: 5, name: 'David Kim', email: 'david@ops.co', role: '运营 (Ops)', status: '已激活' },
  { id: 6, name: 'Tom Hardy', email: 'tom@ops.co', role: '运营 (Ops)', status: '已激活' },
  { id: 7, name: 'Guest User', email: 'guest@temp.co', role: '访客 (Guest)', status: '禁用' },
];

export default function UserPermissionPage() {
  const [searchText, setSearchText] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleEditPermission = (user: any) => {
    setSelectedUser(user);
    setShowPermissionModal(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 relative">
      <GlassCard className="min-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <NeonTitle icon={Users}>用户权限管理 (IAM)</NeonTitle>
          
            <div className="flex items-center gap-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="pl-10 pr-4 py-2 w-[300px] bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm text-slate-700 dark:text-slate-200 transition-all"
                    />
                </div>

                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/50 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] text-sm font-medium">
                  权限策略
                </button>
            </div>
        </div>

        {/* User Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 w-12">
                   <input type="checkbox" className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-cyan-500 focus:ring-offset-0 focus:ring-0" />
                </th>
                {['用户 (User)', '邮箱 (Email)', '角色 (Role)', '状态 (Status)', '操作 (Action)'].map(h => (
                     <th key={h} className="px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
                        {h}
                     </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                     <input type="checkbox" className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-cyan-500 focus:ring-offset-0 focus:ring-0" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:border-cyan-500/50 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                          <Shield size={12} className="text-indigo-400"/>
                          {user.role}
                      </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${
                        user.status === '已激活' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 border-slate-300 dark:border-slate-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === '已激活' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                      {user.status === '已激活' ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleEditPermission(user)}
                        className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-mono underline decoration-cyan-500/30 underline-offset-4"
                      >
                        EDIT_PERMS
                      </button>
                      <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                          <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-lg max-h-[90vh] flex flex-col p-0 border border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
              <div>
                   <h2 className="text-lg font-bold text-slate-900 dark:text-white">权限配置 (Permissions)</h2>
                   <p className="text-xs text-slate-500 font-mono">User: {selectedUser?.name}</p>
              </div>
              <button 
                onClick={() => setShowPermissionModal(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto">
              {/* Menu Permissions */}
              <div>
                <h3 className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase mb-4 flex items-center gap-2">
                    <Shield size={14} /> Menu Access
                </h3>
                <div className="space-y-1">
                  {['Dashboard', 'Data Analysis', 'Operations', 'Settings'].map((item, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-lg cursor-pointer group transition-colors">
                        <div className="relative flex items-center">
                            <input type="checkbox" className="peer w-4 h-4 appearance-none rounded border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 checked:bg-cyan-600 checked:border-cyan-500 transition-colors" defaultChecked />
                            <Check size={10} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item}</span>
                      </label>
                  ))}
                </div>
              </div>

              {/* Data Scope */}
              <div>
                <h3 className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase mb-4 flex items-center gap-2">
                    <Users size={14} /> Data Scope
                </h3>
                <div className="space-y-2">
                    {[
                        { label: 'All Data (Global)', val: 'all' },
                        { label: 'Department Only', val: 'dept' },
                        { label: 'Personal Only', val: 'self' }
                    ].map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-lg cursor-pointer hover:border-cyan-500/30 transition-all">
                             <input type="radio" name="dataScope" className="text-cyan-600 bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600 focus:ring-cyan-500 focus:ring-offset-0" defaultChecked={i===0} />
                             <span className="text-sm text-slate-600 dark:text-slate-300">{opt.label}</span>
                        </label>
                    ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3 bg-slate-50 dark:bg-white/[0.02]">
              <button 
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowPermissionModal(false)}
                className="px-6 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.2)] font-medium transition-all"
              >
                Save Changes
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}