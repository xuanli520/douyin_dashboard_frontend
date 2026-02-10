'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, userId } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !userId) {
        router.push('/login');
      } else {
        setChecked(true);
      }
    }
  }, [isLoading, isAuthenticated, userId, router]);

  if (isLoading && !checked) {
    return <div>Loading...</div>;
  }

  if (!checked) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
