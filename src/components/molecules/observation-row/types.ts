import type { EngramObservation } from '@models/engram';

export interface ObservationRowProps {
  observation: EngramObservation;
  onClick: (obs: EngramObservation) => void;
  /** Show the time as HH:MM:SS (for session detail) instead of date (for memories tab) */
  showTime?: boolean;
}
