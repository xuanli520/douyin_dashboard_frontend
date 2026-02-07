'use client';

import React from 'react';
import { useUserStore } from '@/stores/userStore';
import { can, PermissionCode } from '@/lib/rbac';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

interface PermissionGateProps {
  require: PermissionCode;
  children: React.ReactNode;
  mode?: 'hide' | 'disable';
}

export function PermissionGate({ require, children, mode = 'hide' }: PermissionGateProps) {
  const { currentUser, isSuperuser } = useUserStore();
  
  // Construct a user object that matches UserWithPermissions interface for the 'can' function
  // We use the store's isSuperuser and currentUser.permissions (if it exists)
  const userCheckContext = {
    is_superuser: isSuperuser,
    permissions: currentUser?.permissions
  };

  const hasPermission = can(userCheckContext, require);

  if (hasPermission) {
    return <>{children}</>;
  }

  if (mode === 'hide') {
    return null;
  }

  // mode === 'disable'
  // We assume children is a single React element that supports 'disabled' prop
  // If not, we might need to wrap it.
  // Also wrapping in a Tooltip to explain why it's disabled.
  
  // Clone the child and add disabled prop if it's a valid element
  const disabledChild = React.isValidElement(children) 
    ? React.cloneElement(children as React.ReactElement<any>, { disabled: true })
    : children;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block cursor-not-allowed opacity-50">
             {/* Span wrapper needed because disabled buttons don't trigger mouse events */}
            {disabledChild}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>您没有操作权限</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
