import { Suspense } from 'react';
import RegisterPage from '@/app/components/RegisterPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#050714] text-white">加载中...</div>}>
      <RegisterPage />
    </Suspense>
  );
}
