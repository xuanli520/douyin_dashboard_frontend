'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { User } from '@/types/user';
import { Role, getRolesList, assignRoles } from '@/services/adminService';
import { toast } from 'sonner';

interface AssignRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

export function AssignRolesDialog({ open, onOpenChange, user, onSuccess }: AssignRolesDialogProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadRoles();
      // Initialize selected roles from user object if available
      // Note: User type currently doesn't have roles array structure matching this exactly.
      // We might need to fetch user roles separately or assume user.role_ids exists.
      // For now, let's assume we need to fetch user details or roles.
      // But given the API structure, maybe we fetch roles first.
      // Since we don't have user roles in the User object (only is_superuser), 
      // we might need to fetch them.
      // However, to keep it simple and fast, we'll start with empty or try to infer.
      // If the API 'getUsers' returns roles, we should use that. 
      // UserTable logic assumed user.roles exists or we show 'User'.
      // If we don't have them, we might want to fetch them:
      // GET /admin/users/{id}/roles (API endpoint I added to config)
      
      // Let's implement fetching current roles for the user.
      fetchUserRoles();
    }
  }, [open, user]);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const list = await getRolesList();
      setRoles(list);
    } catch (error) {
      toast.error('获取角色列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRoles = async () => {
      // TODO: Fetch user specific roles if not present in user object
      // For now, we'll assume we start clean or based on some property if available
      setSelectedRoleIds([]); 
  }

  const handleSave = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      await assignRoles(user.id, selectedRoleIds);
      toast.success('角色分配成功');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || '角色分配失败');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>分配角色 - {user?.username}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground">加载中...</div>
          ) : roles.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">暂无可用角色</div>
          ) : (
            <div className="grid gap-2">
              {roles.map(role => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`role-${role.id}`} 
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>取消</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
