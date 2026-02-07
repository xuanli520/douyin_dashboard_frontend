'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDataSource } from '@/features/data-source/hooks/useDataSource';
import { DataSourceDetail } from '@/features/data-source/components/DataSourceDetail';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DataSourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { dataSource, loading, error } = useDataSource(id);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>;
  if (!dataSource) return <div className="p-6">Data source not found.</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">数据源详情</h1>
      </div>

      <DataSourceDetail dataSource={dataSource} />
    </div>
  );
}
