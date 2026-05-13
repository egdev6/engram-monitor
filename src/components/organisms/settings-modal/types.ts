import type { EngramObservation, EngramPrompt } from '@models/engram';

export interface SettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  isExporting: boolean;
  onImport: (file: File) => void;
  isImporting: boolean;
  onMergeClick: () => void;
  showMerge: boolean;
  allObservations: EngramObservation[];
  prompts: EngramPrompt[];
}
