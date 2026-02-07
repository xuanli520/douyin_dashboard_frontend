import React from 'react';
import { DataSource } from '../../services/types';
import { InfoCard } from './InfoCard';
import { AssociatedRules } from './AssociatedRules';

interface DataSourceDetailProps {
  dataSource: DataSource;
  onRefresh: () => void;
}

export function DataSourceDetail({ dataSource, onRefresh }: DataSourceDetailProps) {
  return (
    <div className="space-y-6">
      <InfoCard dataSource={dataSource} onRefresh={onRefresh} />
      <AssociatedRules dataSourceId={dataSource.id} />
    </div>
  );
}
