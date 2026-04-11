import type { EngramFilters } from '@hooks/use-engram';
import type { EngramObservation, EngramSession, EngramStats } from '@models/engram';

export interface EngramDashboardViewProps {
  stats: EngramStats | undefined;
  observations: EngramObservation[];
  sessions: EngramSession[];
  filters: EngramFilters;
  onFiltersChange: (filters: Partial<EngramFilters>) => void;
  isLoadingStats: boolean;
  isLoadingObs: boolean;
  isLoadingSessions: boolean;
  onReset: () => void;
  isResetting: boolean;
}
