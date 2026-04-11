import type { EngramObservationType, EngramScope } from '@models/engram';

export interface EngramFilters {
  query: string;
  project: string;
  type: EngramObservationType | '';
  scope: EngramScope | '';
  sessionId: string;
  limit: number;
}
