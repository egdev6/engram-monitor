import type { EngramSession } from '@models/engram';

export interface SessionsTabProps {
  sessions: EngramSession[];
  loading: boolean;
  allProjects: string[];
}
