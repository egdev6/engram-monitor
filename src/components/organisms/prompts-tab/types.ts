import type { EngramPrompt } from '@models/engram';

export interface PromptsTabProps {
  prompts: EngramPrompt[];
  loading: boolean;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}
