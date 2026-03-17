import { FileText } from 'lucide-react';
import { EndpointStatusWrapper } from '@/app/components/ui/endpoint-status-wrapper';
import { API_ENDPOINTS } from '@/config/api';

export default function DataAnalysisPage() {
  return (
    <EndpointStatusWrapper
      path={API_ENDPOINTS.ANALYSIS_OVERVIEW}
      placeholderProps={{ icon: <FileText size={48} className="text-cyan-500" /> }}
    >
      {null}
    </EndpointStatusWrapper>
  );
}
