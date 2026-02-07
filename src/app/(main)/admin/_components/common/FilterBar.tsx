'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { X, Search } from 'lucide-react';

export type FilterItem =
  | { type: 'input'; key: string; placeholder?: string; debounceMs?: number; label?: string }
  | { type: 'select'; key: string; placeholder?: string; options: { label: string; value: string }[]; label?: string }
  | { type: 'switch'; key: string; label: string };

interface FilterBarProps {
  items: FilterItem[];
  value: Record<string, any>;
  onChange: (patch: Record<string, any>, opts?: { resetPage?: boolean }) => void;
  onReset: () => void;
  className?: string;
}

// Internal component for Debounced Input to manage local state
function DebouncedInput({ 
  value, 
  onChange, 
  placeholder, 
  debounceMs = 500,
  className 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  debounceMs?: number;
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, onChange, value, debounceMs]);

  return (
    <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={`pl-9 ${className}`}
        />
    </div>
  );
}

export function FilterBar({ items, value, onChange, onReset, className }: FilterBarProps) {
  // Determine if any filter is active to show Reset button
  const hasActiveFilters = items.some(item => {
    const val = value[item.key];
    if (item.type === 'switch') return val === true || val === 'true'; // Assuming switch default is false/off
    return val !== undefined && val !== '' && val !== null;
  });

  return (
    <div className={`flex flex-wrap items-end gap-4 ${className}`}>
      {items.map((item) => {
        if (item.type === 'input') {
          return (
            <div key={item.key} className="flex flex-col gap-1.5 w-[200px]">
               {item.label && <Label className="text-xs font-medium">{item.label}</Label>}
              <DebouncedInput
                value={value[item.key] || ''}
                onChange={(val) => onChange({ [item.key]: val }, { resetPage: true })}
                placeholder={item.placeholder || '搜索...'}
                debounceMs={item.debounceMs}
              />
            </div>
          );
        }
        
        if (item.type === 'select') {
          return (
            <div key={item.key} className="flex flex-col gap-1.5 w-[160px]">
               {item.label && <Label className="text-xs font-medium">{item.label}</Label>}
              <Select
                value={value[item.key]?.toString() || ''}
                onValueChange={(val) => onChange({ [item.key]: val === 'ALL' ? undefined : val }, { resetPage: true })}
              >
                <SelectTrigger className="border-none bg-transparent hover:bg-surface/10 text-text-primary focus:ring-0 transition-all rounded-lg h-9 font-medium shadow-none pl-2">
                  <SelectValue placeholder={item.placeholder || '请选择'} />
                </SelectTrigger>
                <SelectContent className="bg-surface/95 backdrop-blur-xl border-border/20 text-text-primary shadow-xl">
                   <SelectItem value="ALL">全部</SelectItem>
                  {item.options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (item.type === 'switch') {
             // Handle boolean/string toggle
             const isChecked = value[item.key] === true || value[item.key] === 'true';
             return (
                <div key={item.key} className="flex flex-col gap-1.5 h-[58px] justify-end pb-2">
                    <div className="flex items-center gap-2">
                        <Switch
                            id={`filter-${item.key}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => onChange({ [item.key]: checked }, { resetPage: true })}
                        />
                         <Label htmlFor={`filter-${item.key}`}>{item.label}</Label>
                    </div>
                </div>
            )
        }
        
        return null;
      })}

      {hasActiveFilters && (
        <div className="flex flex-col gap-1.5 h-[58px] justify-end pb-1">
            <Button variant="ghost" size="sm" onClick={onReset} className="h-9 px-2 text-muted-foreground hover:text-foreground">
            <X className="mr-2 h-4 w-4" />
            重置筛选
            </Button>
        </div>
      )}
    </div>
  );
}
