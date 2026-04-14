import type { EngramObservation } from '@models/engram';

export interface MarkdownPanelProps {
  observation: EngramObservation;
  onClose: () => void;
  onUpdated?: (updated: EngramObservation) => void;
}
