import type { EngramObservation } from '@models/engram';

export interface TopicsTabProps {
  observations: EngramObservation[];
  loading: boolean;
  allProjects: string[];
}
