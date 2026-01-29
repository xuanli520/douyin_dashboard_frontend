'use client';

import React from 'react';
import { DataTable, DataTableColumn } from '../../_components/common/DataTable';
import { UserActions } from './UserActions';
import { User } from '@/types/user';
import { Badge } from '@/app/components/ui/badge';
import { format } from 'date-fns';

interface UserTableProps {
  data: User[];
  isLoading: boolean;
  pagination: { page: number; size: number; total: number };
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  selectedKeys: (string | number)[];
  onSelectionChange: (keys: (string | number)[]) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onAssignRoles: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export function UserTable({
  data,
  isLoading,
  pagination,
  onPageChange,
  onSizeChange,
  selectedKeys,
  onSelectionChange,
  onEdit,
  onDelete,
  onAssignRoles,
  onResetPassword
}: UserTableProps) {
  const columns: DataTableColumn<User>[] = [
    {
      key: 'username',
      header: '用户名',
      render: (user) => <span className="font-medium">{user.username}</span>,
    },
    {
      key: 'email',
      header: '邮箱',
      render: (user) => <span>{user.email}</span>,
    },
    {
      key: 'roles',
      header: '角色',
      render: (user) => {
          if (user.is_superuser) {
              return <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">超级管理员</Badge>
          }
          // Assuming user.roles exists, otherwise show '用户'
          return <Badge variant="secondary">普通用户</Badge>
      },
    },
    {
      key: 'is_active',
      header: '状态',
      render: (user) => (
        <Badge variant={user.is_active ? 'outline' : 'destructive'} className={user.is_active ? "text-green-600 border-green-600" : ""}>
          {user.is_active ? '正常' : '禁用'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: '注册时间',
      render: (user) => {
        if (!user.created_at) return '-';
        try {
            return format(new Date(user.created_at), 'yyyy-MM-dd HH:mm');
        } catch {
            return user.created_at;
        }
      },
    },
    {
      key: 'actions',
      header: '操作',
      width: 50,
      render: (user) => (
        <UserActions
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignRoles={onAssignRoles}
          onResetPassword={onResetPassword}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      pagination={pagination}
      onPageChange={onPageChange}
      onSizeChange={onSizeChange}
      rowKey={(user) => user.id}
      rowSelection={{
        selectedKeys,
        onChange: onSelectionChange,
      }}
    />
  );
}
