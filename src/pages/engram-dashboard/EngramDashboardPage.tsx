import {
  useEngramReset,
  useEngramSearch,
  useEngramSessions,
  useEngramSessionSummaries,
  useEngramPrompts,
  useDeleteSession,
  useDeletePrompt,
} from '@hooks/use-engram';
import type { EngramFilters } from '@hooks/use-engram';
import { useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data: observations = [], isLoading: isLoadingObs }        = useEngramSearch(filters);
  const { data: sessions = [], isLoading: isLoadingSessions }        = useEngramSessions();
  const { data: sessionSummaries = [] }                              = useEngramSessionSummaries();
  const { data: prompts = [], isLoading: isLoadingPrompts }          = useEngramPrompts();
  const resetMutation      = useEngramReset();
  const deleteSessionMut   = useDeleteSession();
  const deletePromptMut    = useDeletePrompt();

  const handleFiltersChange = (partial: Partial<EngramFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleReset = () => {
    if (!window.confirm('¿Eliminar toda la memoria de Engram? Esta acción no se puede deshacer.')) {
      return;
    }
    resetMutation.mutate();
  };

  const handleDeleteSession = (id: string) => {
    if (!window.confirm(`¿Eliminar la sesión "${id}"? Esta acción no se puede deshacer.`)) return;
    deleteSessionMut.mutate(id, {
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 409) {
            setTimeout(() => window.alert(
              `No se puede eliminar la sesión "${id}" porque todavía tiene observaciones asociadas.\n\nElimina primero todas sus observaciones e intenta de nuevo.`,
            ), 0);
          } else if (err.response?.status === 404) {
            queryClient.invalidateQueries({ queryKey: ['engram', 'session-summaries'] });
            queryClient.invalidateQueries({ queryKey: ['engram', 'stats'] });
            setTimeout(() => window.alert(`La sesión "${id}" ya no existe.`), 0);
          } else {
            setTimeout(() => window.alert(`Error al eliminar la sesión: ${err.message}`), 0);
          }
        }
      },
    });
  };

  const handleDeletePrompt = (id: number) => {
    deletePromptMut.mutate(id, {
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            queryClient.invalidateQueries({ queryKey: ['engram', 'prompts'] });
            queryClient.invalidateQueries({ queryKey: ['engram', 'stats'] });
            setTimeout(() => window.alert(`El prompt #${id} ya no existe.`), 0);
          } else {
            setTimeout(() => window.alert(`Error al eliminar el prompt #${id}: ${err.message}`), 0);
          }
        }
      },
    });
  };

  return (
    <EngramDashboardView
      observations={observations}
      sessions={sessions}
      sessionSummaries={sessionSummaries}
      prompts={prompts}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      isLoadingObs={isLoadingObs}
      isLoadingSessions={isLoadingSessions}
      isLoadingPrompts={isLoadingPrompts}
      onReset={handleReset}
      isResetting={resetMutation.isPending}
      onDeleteSession={handleDeleteSession}
      isDeletingSession={deleteSessionMut.isPending}
      onDeletePrompt={handleDeletePrompt}
      isDeletingPrompt={deletePromptMut.isPending}
    />
  );
};

export default EngramDashboardPage;
