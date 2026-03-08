import React from 'react';
import { DataSource } from '../../services/types';
import { InfoCard } from './InfoCard';
import { AssociatedRules } from './AssociatedRules';
import { LoginStateMetaCard } from './LoginStateMetaCard';

interface DataSourceDetailProps {
  dataSource: DataSource;
}

export function DataSourceDetail({ dataSource }: DataSourceDetailProps) {
  return (
    <div className="space-y-6">
      <InfoCard dataSource={dataSource} />
      <LoginStateMetaCard meta={dataSource.config.shop_dashboard_login_state_meta} />
      <AssociatedRules dataSourceId={dataSource.id} />
    </div>
  );
}
