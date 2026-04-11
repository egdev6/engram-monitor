import { useEngramReset, useEngramSearch, useEngramSessions, useEngramStats } from '@hooks/use-engram';
import type { EngramFilters } from '@hooks/use-engram';
import { useState } from 'react';
import { EngramDashboardView } from './EngramDashboardView';

const DEFAULT_FILTERS: EngramFilters = {
  query: '',
  project: '',
  type: '',
  scope: '',
  sessionId: '',
  limit: 50
};

const EngramDashboardPage = () => {
  const [filters, setFilters] = useState<EngramFilters>(DEFAULT_FILTERS);

  const { data: stats, isLoading: isLoadingStats } = useEngramStats();
  const { data: observations = [], isLoading: isLoadingObs } = useEngramSearch(filters);
  const { data: sessions = [], isLoading: isLoadingSessions } = useEngramSessions();
  const resetMutation = useEngramReset();

  const handleFiltersChange = (partial: Partial<EngramFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleReset = () => {
    if (!window.confirm('¿Eliminar toda la memoria de Engram? Esta acción no se puede deshacer.')) {
      return;
    }
    resetMutation.mutate();
  };

  return (
    <EngramDashboardView
      stats={stats}
      observations={observations}
      sessions={sessions}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      isLoadingStats={isLoadingStats}
      isLoadingObs={isLoadingObs}
      isLoadingSessions={isLoadingSessions}
      onReset={handleReset}
      isResetting={resetMutation.isPending}
    />
  );
};

export default EngramDashboardPage;
