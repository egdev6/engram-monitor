import type { EngramObservation } from '@models/engram';

export interface TimelineTabProps {
  observations: EngramObservation[];
  loading: boolean;
  allProjects: string[];
}
