'use client';

import React, { useEffect, useState } from 'react';
import { getPermissions, Permission } from '@/services/adminService';
import { CyberCard } from '@/components/ui/cyber/CyberCard';
import { CyberTable, CyberTableHeader, CyberTableBody, CyberTableRow, CyberTableHead, CyberTableCell } from '@/components/ui/cyber/CyberTable';
import { CyberInput } from '@/components/ui/cyber/CyberInput';
import { CyberBadge } from '@/components/ui/cyber/CyberBadge';
import { Shield, Search, Lock, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const data = await getPermissions();
      setPermissions(data);
    } catch (error) {
      toast.error('加载权限数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const filteredPermissions = permissions.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.module?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground dark:text-slate-400 mt-1 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            系统访问控制定义
          </p>
        </div>
      </div>

      {/* Controls & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CyberCard className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">权限总数</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{permissions.length}</p>
          </div>
        </CyberCard>
        
        {/* Search */}
        <CyberCard className="md:col-span-2 p-4 flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <CyberInput 
              placeholder="搜索代码、名称或模块..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CyberCard>
      </div>

      {/* Main Data Table */}
      <CyberCard className="min-h-[500px]">
        <CyberTable>
          <CyberTableHeader>
            <CyberTableRow>
              <CyberTableHead>ID</CyberTableHead>
              <CyberTableHead>模块</CyberTableHead>
              <CyberTableHead>代码</CyberTableHead>
              <CyberTableHead>名称</CyberTableHead>
              <CyberTableHead>描述</CyberTableHead>
            </CyberTableRow>
          </CyberTableHeader>
          <CyberTableBody>
            {loading ? (
              // Loading Skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <CyberTableRow key={i}>
                  <CyberTableCell><div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></CyberTableCell>
                  <CyberTableCell><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></CyberTableCell>
                  <CyberTableCell><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></CyberTableCell>
                  <CyberTableCell><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></CyberTableCell>
                  <CyberTableCell><div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></CyberTableCell>
                </CyberTableRow>
              ))
            ) : filteredPermissions.length === 0 ? (
              <CyberTableRow>
                <CyberTableCell colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                  未找到匹配的权限。
                </CyberTableCell>
              </CyberTableRow>
            ) : (
              filteredPermissions.map((perm) => (
                <CyberTableRow key={perm.id}>
                  <CyberTableCell className="text-slate-500 dark:text-slate-600">#{perm.id}</CyberTableCell>
                  <CyberTableCell>
                    <CyberBadge variant="outline" className="uppercase tracking-wider text-[10px]">
                      {perm.module || '系统'}
                    </CyberBadge>
                  </CyberTableCell>
                  <CyberTableCell>
                    <div className="flex items-center gap-2 font-mono text-cyan-600 dark:text-cyan-400">
                      <span>{perm.code}</span>
                      <button
                        onClick={() => handleCopy(perm.code)}
                        className="p-1 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded transition-colors"
                        title="复制"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </CyberTableCell>
                  <CyberTableCell className="font-medium text-slate-900 dark:text-white">
                    {perm.name}
                  </CyberTableCell>
                  <CyberTableCell className="text-slate-500 dark:text-slate-400">
                    {perm.description || '-'}
                  </CyberTableCell>
                </CyberTableRow>
              ))
            )}
          </CyberTableBody>
        </CyberTable>
      </CyberCard>
    </div>
  );
}
