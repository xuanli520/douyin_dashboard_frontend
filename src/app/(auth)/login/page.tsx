import { Suspense } from 'react';
import LoginPage from '@/app/components/LoginPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#050714] text-white">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}