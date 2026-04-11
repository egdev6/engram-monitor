import type { EngramSession } from '@models/engram';

export interface SessionDetailViewProps {
  session: EngramSession;
  allProjects: string[];
  onBack: () => void;
}

export interface SessionDetailPageProps {
  sessions: EngramSession[];
  allProjects: string[];
  isLoading: boolean;
}
