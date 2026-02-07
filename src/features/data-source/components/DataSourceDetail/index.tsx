import React from 'react';
import { DataSource } from '../../services/types';
import { InfoCard } from './InfoCard';
import { AssociatedRules } from './AssociatedRules';

interface DataSourceDetailProps {
  dataSource: DataSource;
}

export function DataSourceDetail({ dataSource }: DataSourceDetailProps) {
  return (
    <div className="space-y-6">
      <InfoCard dataSource={dataSource} />
      <AssociatedRules dataSourceId={dataSource.id} />
    </div>
  );
}
