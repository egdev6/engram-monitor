export interface MergeProjectsModalProps {
  projects: string[];
  onMerge: (from: string, to: string) => void;
  isMerging: boolean;
  onClose: () => void;
}
