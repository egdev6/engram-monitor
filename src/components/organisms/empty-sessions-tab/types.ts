import type { EngramSessionSummary } from '@models/engram';

export interface EmptySessionsTabProps {
  sessionSummaries: EngramSessionSummary[];
  loading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}
