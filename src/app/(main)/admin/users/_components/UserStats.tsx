'use client';

import React from 'react';
import { UserStats as UserStatsType } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Users, UserCheck, UserX, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';

interface UserStatsProps {
  stats: UserStatsType;
  isLoading?: boolean;
}

export function UserStats({ stats, isLoading }: UserStatsProps) {
  const items = [
    {
      title: '总用户数',
      value: stats.total,
      icon: Users,
      description: '所有注册用户',
    },
    {
      title: '活跃用户',
      value: stats.active,
      icon: UserCheck,
      description: '当前状态正常的用户',
      className: 'text-green-600',
    },
    {
      title: '停用用户',
      value: stats.inactive,
      icon: UserX,
      description: '已被禁用的用户',
      className: 'text-red-600',
    },
    {
      title: '超级管理员',
      value: stats.superusers,
      icon: ShieldAlert,
      description: '拥有最高权限',
      className: 'text-purple-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Icon className={`h-4 w-4 text-muted-foreground ${item.className}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{item.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
