'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  getRolesList,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  assignPermissions,
  Role,
  Permission
} from '@/services/adminService';
import { CyberButton } from '@/components/ui/cyber/CyberButton';
import { CyberInput } from '@/components/ui/cyber/CyberInput';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/cyber/CyberDialog';
import { Plus, ShieldAlert, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { RoleTable } from './RoleTable';

interface RoleFormValues {
  name: string;
  description: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog States
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting }
  } = useForm<RoleFormValues>();

  // Permission Assignment State
  const [isPermDialogOpen, setIsPermDialogOpen] = useState(false);
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<Role | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());
  const [isPermSubmitting, setIsPermSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permsData] = await Promise.all([
        getRolesList(),
        getPermissions()
      ]);

      const rolesWithPermissions = await Promise.all(
        rolesData.map(async (role) => {
          try {
            return await getRole(role.id);
          } catch {
            return role;
          }
        })
      );

      setRoles(rolesWithPermissions);
      setPermissions(permsData);
    } catch (error) {
      toast.error('加载角色数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Role CRUD ---

  const handleCreateClick = () => {
    setEditingRole(null);
    reset({ name: '', description: '' });
    setIsRoleDialogOpen(true);
  };

  const handleEditClick = (role: Role) => {
    setEditingRole(role);
    setValue('name', role.name);
    setValue('description', role.description || '');
    setIsRoleDialogOpen(true);
  };

  const onRoleSubmit = async (data: RoleFormValues) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, { name: data.name, description: data.description });
        toast.success('角色已更新');
      } else {
        await createRole({ name: data.name, description: data.description });
        toast.success('角色已创建');
      }
      setIsRoleDialogOpen(false);
      fetchData();
      setPage(1);
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleDeleteClick = async (role: Role) => {
    if (!confirm(`确定要删除角色 "${role.name}" 吗？此操作无法撤销。`)) return;

    try {
      await deleteRole(role.id);
      toast.success('角色已删除');
      setRoles(roles.filter(r => r.id !== role.id));
    } catch (error) {
      toast.error('删除角色失败');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  // --- Permission Assignment ---

  const handlePermsClick = (role: Role) => {
    setSelectedRoleForPerms(role);
    const currentIds = new Set(role.permissions?.map(p => p.id) || []);
    setSelectedPermIds(currentIds);
    setIsPermDialogOpen(true);
  };

  const togglePerm = (id: number) => {
    const newSet = new Set(selectedPermIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPermIds(newSet);
  };

  const handlePermsSubmit = async () => {
    if (!selectedRoleForPerms) return;
    setIsPermSubmitting(true);
    try {
      await assignPermissions(selectedRoleForPerms.id, Array.from(selectedPermIds));
      toast.success('权限已更新');
      setIsPermDialogOpen(false);

      const updatedRole = await getRole(selectedRoleForPerms.id);
      setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));

    } catch (error) {
      toast.error('更新权限失败');
    } finally {
      setIsPermSubmitting(false);
    }
  };

  // Group permissions by module
  const permsByModule = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const module = perm.module || 'Other';
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground dark:text-slate-400 mt-1 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            定义角色并分配访问级别
          </p>
        </div>
        <CyberButton onClick={handleCreateClick} className="shadow-lg shadow-cyan-500/20 group">
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          新建角色
        </CyberButton>
      </div>

      <RoleTable
        data={roles}
        loading={loading}
        pagination={{ page, size: pageSize, total: roles.length }}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onAssignPermissions={handlePermsClick}
      />

      {/* Create/Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? '编辑角色' : '新建角色'}</DialogTitle>
            <DialogDescription>
              配置角色详细信息。系统角色无法重命名。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onRoleSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">角色名称</label>
              <CyberInput
                {...register('name', { required: '角色名称为必填项' })}
                placeholder="例如：内容编辑"
                disabled={editingRole?.is_system}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <CyberInput
                {...register('description')}
                placeholder="职责简述..."
              />
            </div>
            <DialogFooter>
              <CyberButton type="button" variant="ghost" onClick={() => setIsRoleDialogOpen(false)}>取消</CyberButton>
              <CyberButton type="submit" isLoading={isFormSubmitting}>
                {editingRole ? '保存更改' : '创建角色'}
              </CyberButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Assignment Dialog */}
      <Dialog open={isPermDialogOpen} onOpenChange={setIsPermDialogOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>分配权限： <span className="text-cyan-500">{selectedRoleForPerms?.name}</span></DialogTitle>
            <DialogDescription>
              选择此角色应拥有的功能权限。
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 my-4 space-y-6">
            {Object.entries(permsByModule).map(([module, perms]) => (
              <div key={module} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-cyan-400 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3" />
                  {module} 模块
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {perms.map(perm => {
                    const isSelected = selectedPermIds.has(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePerm(perm.id)}
                        className={`
                          cursor-pointer p-3 rounded border transition-all duration-200 flex items-start gap-3 select-none
                          ${isSelected
                            ? 'bg-blue-50 border-blue-200 dark:bg-cyan-900/20 dark:border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                            : 'bg-white border-slate-100 dark:bg-slate-800/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}
                        `}
                      >
                        <div className={`
                          mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors
                          ${isSelected
                            ? 'bg-blue-500 border-blue-500 dark:bg-cyan-500 dark:border-cyan-500'
                            : 'border-slate-300 dark:border-slate-600'}
                        `}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            {perm.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                            {perm.description}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 mt-1">{perm.code}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-auto pt-4 border-t border-slate-100 dark:border-white/10">
            <div className="mr-auto text-sm text-slate-500 flex items-center">
              已选择： <span className="font-bold ml-1 text-slate-900 dark:text-white">{selectedPermIds.size}</span>
            </div>
            <CyberButton type="button" variant="ghost" onClick={() => setIsPermDialogOpen(false)}>取消</CyberButton>
            <CyberButton type="button" onClick={handlePermsSubmit} isLoading={isPermSubmitting}>
              保存权限
            </CyberButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
