export interface ImportDataShape {
  observations: ImportedObservation[];
  prompts: ImportedPrompt[];
}

export interface ImportedObservation {
  title: string;
  content: string;
  sessionId?: string;
  type?: string;
  project?: string;
  scope?: string;
  createdAt?: string;
}

export interface ImportedPrompt {
  content: string;
  sessionId?: string;
  project?: string;
  createdAt?: string;
}

export interface ImportFingerprintSets {
  observationFingerprints: Set<string>;
  promptFingerprints: Set<string>;
}

export interface ImportRiskResult {
  blocked: boolean;
  reasons: string[];
  internalObservationDuplicates: number;
  internalPromptDuplicates: number;
  existingObservationDuplicates: number;
  existingPromptDuplicates: number;
}
