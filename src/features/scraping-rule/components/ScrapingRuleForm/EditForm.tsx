'use client';

import React, { useEffect, useState } from 'react';
import { BaseForm } from './BaseForm';
import { useUpdateScrapingRule } from '../../hooks/useUpdateScrapingRule';
import { useScrapingRule } from '../../hooks/useScrapingRule';
import { useDataSources } from '@/features/data-source/hooks/useDataSources';
import { useRouter } from 'next/navigation';

interface EditFormProps {
  id: number;
}

export function EditForm({ id }: EditFormProps) {
  const router = useRouter();
  const { rule, loading: loadingRule } = useScrapingRule(id);
  const { update, loading: saving } = useUpdateScrapingRule();
  const { data: dataSources } = useDataSources({ pageSize: 100 });
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (rule) {
      setInitialData({
        name: rule.name,
        description: rule.description,
        rule_type: rule.rule_type,
        data_source_id: rule.data_source_id,
        schedule_type: rule.schedule_type,
        schedule_value: rule.schedule_value,
        config: rule.config,
      });
    }
  }, [rule]);

  const handleSubmit = async (values: any) => {
    await update(id, values);
    router.push('/scraping-rule');
  };

  const handleCancel = () => {
    router.back();
  };

  if (loadingRule) return <div>加载中...</div>;
  if (!rule) return <div>未找到规则</div>;

  return (
    <BaseForm
      initialData={initialData}
      dataSources={dataSources?.list}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="保存更改"
      isLoading={saving}
    />
  );
}
