'use client';

import React from 'react';
import { BaseForm } from './BaseForm';
import { useCreateScrapingRule } from '../../hooks/useCreateScrapingRule';
import { useDataSources } from '@/features/data-source/hooks/useDataSources';
import { useRouter } from 'next/navigation';

export function CreateForm({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) {
  const router = useRouter();
  const { create, loading } = useCreateScrapingRule();
  const { data: dataSources } = useDataSources({ pageSize: 100 });

  const handleSubmit = async (values: any) => {
    await create(values);
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/scraping-rule');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <BaseForm
      dataSources={dataSources?.list}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="创建规则"
      isLoading={loading}
    />
  );
}
