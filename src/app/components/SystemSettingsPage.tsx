'use client';

import { useState } from 'react';
import { Settings, Bell, Lock, Palette, Save, Moon, Sun, Monitor } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    // 通知设置
    emailNotification: true,
    pushNotification: true,
    riskAlert: true,
    taskReminder: true,
    // 安全设置
    twoFactorAuth: false,
    sessionTimeout: '30',
    // 系统设置
    language: 'zh-CN',
    theme: 'light',
    timezone: 'Asia/Shanghai',
  });

  const handleSave = () => {
    // TODO: 保存设置到后端
  };

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
    <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-cyan-600 shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'bg-slate-700'}`}
    >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050714] text-slate-200 p-6 space-y-6">
      <GlassCard className="max-w-4xl mx-auto p-8">
        {/* 标题 */}
        <div className="mb-8 border-b border-white/10 pb-6 flex items-center gap-4">
           <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <Settings size={24} />
           </div>
           <div>
               <h1 className="text-xl font-bold text-white tracking-tight">系统设置 (System Config)</h1>
               <p className="text-sm text-slate-500 font-mono mt-1">Configure global parameters and user preferences</p>
           </div>
        </div>

        <div className="space-y-10">
          {/* 通知设置 */}
          <div>
            <NeonTitle icon={Bell}>通知设置 (Notifications)</NeonTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">邮件通知</p>
                  <p className="text-xs text-slate-500 mt-1">Receive daily reports via email</p>
                </div>
                <Toggle checked={settings.emailNotification} onChange={(c) => setSettings({ ...settings, emailNotification: c })} />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">推送通知</p>
                  <p className="text-xs text-slate-500 mt-1">Browser push notifications</p>
                </div>
                <Toggle checked={settings.pushNotification} onChange={(c) => setSettings({ ...settings, pushNotification: c })} />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">风险预警</p>
                  <p className="text-xs text-slate-500 mt-1">Instant alerts for P0/P1 risks</p>
                </div>
                <Toggle checked={settings.riskAlert} onChange={(c) => setSettings({ ...settings, riskAlert: c })} />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">任务提醒</p>
                  <p className="text-xs text-slate-500 mt-1">Schedule task completion alerts</p>
                </div>
                <Toggle checked={settings.taskReminder} onChange={(c) => setSettings({ ...settings, taskReminder: c })} />
              </div>
            </div>
          </div>

          {/* 安全设置 */}
          <div>
            <NeonTitle icon={Lock}>安全设置 (Security)</NeonTitle>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-200">双因素认证 (2FA)</p>
                  <p className="text-xs text-slate-500 mt-1">Require mobile verification for login</p>
                </div>
                <Toggle checked={settings.twoFactorAuth} onChange={(c) => setSettings({ ...settings, twoFactorAuth: c })} />
              </div>

              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between">
                 <div>
                    <p className="text-sm font-medium text-slate-200">会话超时时间</p>
                    <p className="text-xs text-slate-500 mt-1">Auto-logout duration</p>
                 </div>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="120">2 Hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* 外观设置 */}
          <div>
             <NeonTitle icon={Palette}>外观设置 (Appearance)</NeonTitle>
             <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                <p className="text-sm font-medium text-slate-200 mb-4">界面主题</p>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                      settings.theme === 'light'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-white/5'
                    }`}
                  >
                    <Sun size={24} />
                    <span className="text-xs font-mono">LIGHT</span>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-white/5'
                    }`}
                  >
                    <Moon size={24} />
                    <span className="text-xs font-mono">DARK (Cyber)</span>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'system' })}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                      settings.theme === 'system'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-white/5'
                    }`}
                  >
                    <Monitor size={24} />
                    <span className="text-xs font-mono">AUTO</span>
                  </button>
                </div>
              </div>
          </div>

          {/* 保存按钮 */}
          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] font-bold tracking-wide"
            >
              <Save size={18} />
              保存当前配置
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
