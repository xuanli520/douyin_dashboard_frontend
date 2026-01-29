'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/app/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { EmptyState } from './EmptyState';
import { Skeleton } from '@/app/components/ui/skeleton';
import { cn } from '@/app/components/ui/utils';

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: number | string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  error?: string | null;
  pagination: { page: number; size: number; total: number };
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  rowKey: (row: T) => string | number;
  rowSelection?: {
    selectedKeys: Array<string | number>;
    onChange: (keys: Array<string | number>) => void;
  };
  toolbar?: React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  pagination,
  onPageChange,
  onSizeChange,
  rowKey,
  rowSelection,
  toolbar,
  className
}: DataTableProps<T>) {
  const totalPages = Math.ceil(pagination.total / pagination.size);

  const handleSelectAll = (checked: boolean) => {
    if (!rowSelection) return;
    if (checked) {
      rowSelection.onChange(data.map(row => rowKey(row)));
    } else {
      rowSelection.onChange([]);
    }
  };

  const handleSelectRow = (key: string | number, checked: boolean) => {
    if (!rowSelection) return;
    if (checked) {
      rowSelection.onChange([...rowSelection.selectedKeys, key]);
    } else {
      rowSelection.onChange(rowSelection.selectedKeys.filter(k => k !== key));
    }
  };

  const isAllSelected = rowSelection && data.length > 0 && data.every(row => rowSelection.selectedKeys.includes(rowKey(row)));
  const isPartiallySelected = rowSelection && data.length > 0 && !isAllSelected && data.some(row => rowSelection.selectedKeys.includes(rowKey(row)));

  const renderPagination = () => {
    if (totalPages <= 1 && pagination.page === 1) return null;

    // Simple pagination logic: show current, prev, next, first, last
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (pagination.page <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (pagination.page >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', pagination.page - 1, pagination.page, pagination.page + 1, 'ellipsis', totalPages);
      }
    }

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
                共 {pagination.total} 条
            </span>
            <div className="flex items-center space-x-1">
                <span>每页</span>
                <Select
                    value={pagination.size.toString()}
                    onValueChange={(val) => onSizeChange(Number(val))}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={pagination.size} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[10, 20, 50, 100].map(size => (
                            <SelectItem key={size} value={size.toString()}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span>条</span>
            </div>
        </div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(pagination.page > 1) onPageChange(pagination.page - 1); }} 
                aria-disabled={pagination.page <= 1}
                className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {pages.map((p, i) => (
              <PaginationItem key={i}>
                {p === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink 
                    href="#" 
                    isActive={pagination.page === p}
                    onClick={(e) => { e.preventDefault(); onPageChange(p as number); }}
                  >
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(pagination.page < totalPages) onPageChange(pagination.page + 1); }}
                aria-disabled={pagination.page >= totalPages}
                className={pagination.page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {toolbar && <div className="flex items-center justify-between">{toolbar}</div>}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {rowSelection && (
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={isAllSelected || (isPartiallySelected ? "indeterminate" : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  />
                </TableHead>
              )}
              {columns.map(col => (
                <TableHead key={col.key} style={{ width: col.width }}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: Math.min(pagination.size, 5) }).map((_, i) => (
                <TableRow key={i}>
                  {rowSelection && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                  {columns.map((col, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-[80%]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length + (rowSelection ? 1 : 0)} className="h-24 text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (rowSelection ? 1 : 0)} className="h-24">
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const key = rowKey(row);
                const isSelected = rowSelection?.selectedKeys.includes(key);
                return (
                  <TableRow key={key} data-state={isSelected ? "selected" : undefined}>
                    {rowSelection && (
                      <TableCell>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(key, checked === true)}
                        />
                      </TableCell>
                    )}
                    {columns.map(col => (
                      <TableCell key={col.key}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {renderPagination()}
    </div>
  );
}
