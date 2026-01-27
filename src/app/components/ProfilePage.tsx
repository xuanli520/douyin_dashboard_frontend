'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Save, Camera, User, Mail, Phone, Building, Shield, Award } from 'lucide-react';
import maleAvatar from '@/assets/male.jpg';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';
import { getCurrentUser, updateCurrentUser, type User as AuthUser } from '@/lib/auth';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '138****8888',
    department: '技术部',
    role: '加载中...',
    position: '技术总监',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          username: currentUser.username || '',
          email: currentUser.email || '',
          role: currentUser.is_superuser ? '超级管理员' : '普通用户'
        }));
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    try {
      const updatedUser = await updateCurrentUser({
        username: formData.username,
        email: formData.email,
      });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('保存失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-1/4 left-1/4 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      <GlassCard className="max-w-4xl mx-auto p-8 relative z-10">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-6 mb-8 flex justify-between items-end">
            <div>
                 <NeonTitle icon={User}>个人信息中心</NeonTitle>
                 <p className="text-sm text-slate-500 font-mono mt-1">Manage your personal account details</p>
            </div>
             <div className="px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-mono shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                STATUS: ACTIVE
             </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column: Avatar & Status */}
          <div className="flex flex-col items-center gap-6 md:w-1/3">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-800 shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-500">
                <Image
                  src={maleAvatar}
                  alt="用户头像"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors border-2 border-white dark:border-[#050714] shadow-lg group-hover:scale-110">
                <Camera size={18} />
              </button>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formData.username || '用户'}</h2>
              <p className="text-sm text-cyan-600 dark:text-cyan-400 font-mono mt-1">{formData.position}</p>
            </div>

            <div className="w-full space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Shield size={18} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-mono uppercase">Role</div>
                        <div className="text-sm text-slate-700 dark:text-slate-200 font-medium">{formData.role}</div>
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <Award size={18} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-mono uppercase">Level</div>
                        <div className="text-sm text-slate-700 dark:text-slate-200 font-medium">L7 Senior</div>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="flex-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 用户名 */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <User size={14} /> 用户名 (Username)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-slate-900 dark:text-slate-200 transition-all"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-lg text-slate-600 dark:text-slate-300 font-mono">
                    {formData.username || '-'}
                  </div>
                )}
              </div>

              {/* 邮箱 */}
              <div className="space-y-2">
                 <label className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} /> 邮箱 (Email)
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-slate-900 dark:text-slate-200 transition-all"
                  />
                ) : (
                   <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-lg text-slate-600 dark:text-slate-300 font-mono">
                    {formData.email || '-'}
                  </div>
                )}
              </div>

              {/* 手机号 */}
              <div className="space-y-2">
                 <label className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} /> 手机号 (Phone)
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-slate-900 dark:text-slate-200 transition-all"
                  />
                ) : (
                   <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-lg text-slate-600 dark:text-slate-300 font-mono">
                    {formData.phone}
                  </div>
                )}
              </div>

              {/* 部门 */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building size={14} /> 部门 (Department)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-slate-900 dark:text-slate-200 transition-all"
                  />
                ) : (
                   <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-lg text-slate-600 dark:text-slate-300 font-mono">
                    {formData.department}
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10 flex items-center gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] font-medium"
                  >
                    <Save size={18} />
                    保存更改
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.1] hover:border-cyan-500/50 transition-all shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] font-medium"
                >
                  编辑资料
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}