import React from 'react';
import { ScrapingRule } from '../../services/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash, Play, Pause, Eye } from 'lucide-react';
import { RuleTypeTag } from '../common/RuleTypeTag';
import { RuleStatusTag } from '../common/RuleStatusTag';
import { ScheduleDisplay } from '../common/ScheduleDisplay';
import { useRouter } from 'next/navigation';

interface RuleTableProps {
  data: ScrapingRule[];
  onDelete: (id: number) => void;
  onToggleActive: (id: number, active: boolean) => void;
}

export function RuleTable({ data, onDelete, onToggleActive }: RuleTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>调度</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>最后运行</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                未找到规则。
              </TableCell>
            </TableRow>
          ) : (
            data.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{rule.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{rule.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <RuleTypeTag type={rule.rule_type} />
                </TableCell>
                <TableCell>
                  <ScheduleDisplay type={rule.schedule_type} value={rule.schedule_value} />
                </TableCell>
                <TableCell>
                  <RuleStatusTag status={rule.status} />
                </TableCell>
                <TableCell>
                  {rule.last_run_at ? new Date(rule.last_run_at).toLocaleString() : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">打开菜单</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/scraping-rule/${rule.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/scraping-rule/${rule.id}/edit`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleActive(rule.id, rule.status !== 'active')}>
                        {rule.status === 'active' ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            停用
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            启用
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(rule.id)} className="text-red-600 focus:text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
