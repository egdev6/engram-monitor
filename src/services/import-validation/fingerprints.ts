import type { EngramObservation, EngramPrompt } from '@models/engram';
import type { ImportedObservation, ImportedPrompt } from './types';

type ObservationFingerprintInput = Partial<
  Pick<ImportedObservation, 'sessionId' | 'type' | 'title' | 'content' | 'project' | 'scope' | 'createdAt'>
>;

type PromptFingerprintInput = Partial<Pick<ImportedPrompt, 'sessionId' | 'content' | 'project' | 'createdAt'>>;

const normalize = (value: string): string => {
  return value
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

const safe = (value: unknown): string => {
  return typeof value === 'string' ? normalize(value) : '';
};

const compactFingerprint = (parts: [string, string][]): string => {
  return parts
    .filter(([, value]) => value.length > 0)
    .map(([key, value]) => `${key}=${value}`)
    .join('::');
};

export const fingerprintObservation = (observation: ObservationFingerprintInput): string => {
  const primary = compactFingerprint([
    ['session', safe(observation.sessionId)],
    ['type', safe(observation.type)],
    ['title', safe(observation.title)],
    ['content', safe(observation.content)],
    ['project', safe(observation.project)],
    ['scope', safe(observation.scope)],
    ['created', safe(observation.createdAt)]
  ]);

  if (primary.length > 0) {
    return primary;
  }

  return compactFingerprint([
    ['title', safe(observation.title)],
    ['content', safe(observation.content)]
  ]);
};

export const fingerprintPrompt = (prompt: PromptFingerprintInput): string => {
  const primary = compactFingerprint([
    ['session', safe(prompt.sessionId)],
    ['content', safe(prompt.content)],
    ['project', safe(prompt.project)],
    ['created', safe(prompt.createdAt)]
  ]);

  if (primary.length > 0) {
    return primary;
  }

  return safe(prompt.content);
};

export const buildObservationFingerprintSet = (observations: EngramObservation[]): Set<string> => {
  return new Set(observations.map(fingerprintObservation));
};

export const buildPromptFingerprintSet = (prompts: EngramPrompt[]): Set<string> => {
  return new Set(prompts.map(fingerprintPrompt));
};
