import React, { useState } from 'react';
import { DataSource } from '../../services/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { StatusTag } from '../common/StatusTag';
import { TypeTag } from '../common/TypeTag';
import { Button } from '@/app/components/ui/button';
import { Power, PowerOff, Activity } from 'lucide-react';
import { useActivateDataSource } from '../../hooks/useActivateDataSource';
import { useValidateDataSource } from '../../hooks/useValidateDataSource';
import { toast } from 'sonner';

interface InfoCardProps {
  dataSource: DataSource;
}

export function InfoCard({ dataSource: initialDataSource }: InfoCardProps) {
  const [dataSource, setDataSource] = useState<DataSource>(initialDataSource);
  const { activate, loading: activating } = useActivateDataSource();
  const { validate, validating, validationResult } = useValidateDataSource();

  const isActive = dataSource.status === 'active';

  const handleToggleActive = async () => {
    try {
      await activate(dataSource.id, !isActive);
      setDataSource(prev => ({ ...prev, status: isActive ? 'inactive' : 'active' }));
      toast.success(isActive ? '数据源已停用' : '数据源已启用');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleValidate = async () => {
    await validate(dataSource.config);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-4">
          <TypeTag type={dataSource.type} />
          <div>
            <CardTitle className="text-xl font-bold">{dataSource.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{dataSource.description || '暂无描述'}</p>
          </div>
        </div>
        <StatusTag status={dataSource.status} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground">同步频率</h4>
              <p className="font-mono">{dataSource.frequency}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground">最后更新</h4>
              <p className="font-mono">{dataSource.last_update ? new Date(dataSource.last_update).toLocaleString() : '-'}</p>
            </div>
            <div>
               <h4 className="text-sm font-medium mb-1 text-muted-foreground">创建时间</h4>
               <p className="font-mono">{new Date(dataSource.created_at).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">配置</h4>
              <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
                <pre className="text-xs text-slate-50 font-mono">
                  {JSON.stringify(dataSource.config, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={validating}
          >
            <Activity className={`w-4 h-4 mr-2 ${validating ? 'animate-spin' : ''}`} />
            {validating ? '验证中...' : '测试连接'}
          </Button>
          
          <Button 
            variant={dataSource.status === 'active' ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleActive}
            disabled={activating}
          >
            {dataSource.status === 'active' ? (
              <>
                <PowerOff className="w-4 h-4 mr-2" />
                停用
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-2" />
                启用
              </>
            )}
          </Button>
        </div>

        {validationResult && (
          <div className={`mt-4 p-3 rounded text-sm ${validationResult.success ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
             {validationResult.success ? '连接成功' : `连接失败: ${validationResult.message}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
