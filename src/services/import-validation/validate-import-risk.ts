import type { EngramObservation, EngramPrompt } from '@models/engram';
import {
  buildObservationFingerprintSet,
  buildPromptFingerprintSet,
  fingerprintObservation,
  fingerprintPrompt
} from './fingerprints';
import type { ImportDataShape, ImportRiskResult } from './types';

export const validateImportRisk = (
  importData: ImportDataShape,
  existingObservations: EngramObservation[],
  existingPrompts: EngramPrompt[]
): ImportRiskResult => {
  const reasons: string[] = [];
  const seenImportObs = new Set<string>();
  const seenImportPrompts = new Set<string>();
  const existingObsSet = buildObservationFingerprintSet(existingObservations);
  const existingPromptsSet = buildPromptFingerprintSet(existingPrompts);

  let internalObservationDuplicates = 0;
  let internalPromptDuplicates = 0;
  let existingObservationDuplicates = 0;
  let existingPromptDuplicates = 0;

  for (const observation of importData.observations) {
    const fp = fingerprintObservation(observation);
    if (seenImportObs.has(fp)) {
      internalObservationDuplicates += 1;
    } else {
      seenImportObs.add(fp);
    }

    if (existingObsSet.has(fp)) {
      existingObservationDuplicates += 1;
    }
  }

  for (const prompt of importData.prompts) {
    const fp = fingerprintPrompt(prompt);
    if (seenImportPrompts.has(fp)) {
      internalPromptDuplicates += 1;
    } else {
      seenImportPrompts.add(fp);
    }

    if (existingPromptsSet.has(fp)) {
      existingPromptDuplicates += 1;
    }
  }

  if (internalObservationDuplicates > 0 || internalPromptDuplicates > 0) {
    reasons.push('The selected file contains duplicated observations/prompts inside the same import file.');
  }

  if (existingObservationDuplicates > 0 || existingPromptDuplicates > 0) {
    reasons.push('The selected file appears to overlap with existing dashboard observations/prompts.');
  }

  return {
    blocked: reasons.length > 0,
    reasons,
    internalObservationDuplicates,
    internalPromptDuplicates,
    existingObservationDuplicates,
    existingPromptDuplicates
  };
};
