import React from 'react';
import { ScrapingRuleType } from '../../services/types';
import { List, ShoppingCart, Users, MessageSquare } from 'lucide-react';

interface RuleTypeTagProps {
  type: ScrapingRuleType;
}

export function RuleTypeTag({ type }: RuleTypeTagProps) {
  const config: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    orders: {
      icon: ShoppingCart,
      label: '订单',
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    products: {
      icon: List,
      label: '商品',
      className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    users: {
      icon: Users,
      label: '用户',
      className: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    },
    comments: {
      icon: MessageSquare,
      label: '评论',
      className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
  };

  const { icon: Icon, label, className } = config[type] || config.orders;

  return (
    <div className={`px-2 py-1 rounded-md inline-flex items-center gap-2 text-xs font-medium ${className}`}>
      <Icon size={14} />
      {label}
    </div>
  );
}
