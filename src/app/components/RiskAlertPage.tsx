import { ShieldAlert } from 'lucide-react';
import { EndpointStatusWrapper } from '@/app/components/ui/endpoint-status-wrapper';
import { API_ENDPOINTS } from '@/config/api';

export default function RiskAlertPage() {
  return (
    <EndpointStatusWrapper
      path={API_ENDPOINTS.ALERTS_LIST}
      placeholderProps={{ icon: <ShieldAlert size={48} className="text-rose-500" /> }}
    >
      {null}
    </EndpointStatusWrapper>
  );
}
