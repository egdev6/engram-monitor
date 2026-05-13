import type { ImportDataShape, ImportedObservation, ImportedPrompt } from './types';

const asObservationArray = (value: unknown): ImportedObservation[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is ImportedObservation => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    const record = item as Record<string, unknown>;
    return typeof record.title === 'string' && typeof record.content === 'string';
  });
};

const mapObservation = (item: ImportedObservation): ImportedObservation => {
  const record = item as ImportedObservation & Record<string, unknown>;
  return {
    title: record.title,
    content: record.content,
    sessionId:
      typeof record.session_id === 'string'
        ? record.session_id
        : typeof record.sessionId === 'string'
          ? record.sessionId
          : undefined,
    type: typeof record.type === 'string' ? record.type : undefined,
    project: typeof record.project === 'string' ? record.project : undefined,
    scope: typeof record.scope === 'string' ? record.scope : undefined,
    createdAt:
      typeof record.created_at === 'string'
        ? record.created_at
        : typeof record.createdAt === 'string'
          ? record.createdAt
          : undefined
  };
};

const asPromptArray = (value: unknown): ImportedPrompt[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is ImportedPrompt => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    const record = item as Record<string, unknown>;
    return typeof record.content === 'string';
  });
};

const mapPrompt = (item: ImportedPrompt): ImportedPrompt => {
  const record = item as ImportedPrompt & Record<string, unknown>;
  return {
    content: record.content,
    sessionId:
      typeof record.session_id === 'string'
        ? record.session_id
        : typeof record.sessionId === 'string'
          ? record.sessionId
          : undefined,
    project: typeof record.project === 'string' ? record.project : undefined,
    createdAt:
      typeof record.created_at === 'string'
        ? record.created_at
        : typeof record.createdAt === 'string'
          ? record.createdAt
          : undefined
  };
};

export const parseImportFile = async (file: File): Promise<ImportDataShape> => {
  const raw = await file.text();
  const payload = JSON.parse(raw) as Record<string, unknown>;

  return {
    observations: asObservationArray(payload.observations).map(mapObservation),
    prompts: asPromptArray(payload.prompts).map(mapPrompt)
  };
};
