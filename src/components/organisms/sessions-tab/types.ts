import type { EngramSession, EngramSessionSummary } from '@models/engram';

export interface SessionsTabProps {
  sessions: EngramSession[];
  /** All backend sessions — used to surface empty ones (observation_count = 0). */
  sessionSummaries: EngramSessionSummary[];
  loading: boolean;
  allProjects: string[];
  onDeleteEmptySession: (id: string) => void;
  isDeletingSession: boolean;
}
