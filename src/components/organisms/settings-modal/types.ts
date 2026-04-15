import type { RefObject } from 'react';

export interface SettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  isExporting: boolean;
  onImport: (file: File) => void;
  isImporting: boolean;
  onMergeClick: () => void;
  showMerge: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
}
