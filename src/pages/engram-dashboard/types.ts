import type { EngramFilters } from '@hooks/use-engram';
import type { EngramObservation, EngramPrompt, EngramSession, EngramSessionSummary } from '@models/engram';

export interface EngramDashboardViewProps {
  observations: EngramObservation[];
  sessions: EngramSession[];
  /** All sessions from the backend — used to find empty ones and derive stats. */
  sessionSummaries: EngramSessionSummary[];
  prompts: EngramPrompt[];
  filters: EngramFilters;
  onFiltersChange: (filters: Partial<EngramFilters>) => void;
  isLoadingObs: boolean;
  isLoadingSessions: boolean;
  isLoadingPrompts: boolean;
  onReset: () => void;
  isResetting: boolean;
  onDeleteSession: (id: string) => void;
  isDeletingSession: boolean;
  onDeletePrompt: (id: number) => void;
  isDeletingPrompt: boolean;
  onExport: () => void;
  isExporting: boolean;
  onImport: (file: File) => void;
  isImporting: boolean;
  onMergeProjects: (from: string, to: string) => void;
  isMergingProjects: boolean;
}
