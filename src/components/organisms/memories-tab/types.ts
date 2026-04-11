import type { EngramObservation } from '@models/engram';
import type { EngramDashboardViewProps } from '@pages/engram-dashboard/types';

export interface MemoriesTabProps {
  observations: EngramObservation[];
  filters: EngramDashboardViewProps['filters'];
  onFiltersChange: EngramDashboardViewProps['onFiltersChange'];
  isLoading: boolean;
  projects: string[];
}
