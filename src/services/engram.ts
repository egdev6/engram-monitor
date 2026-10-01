import { engramApi } from '@config/engram';
import type {
  EngramContext,
  EngramHealth,
  EngramObservation,
  EngramObservationUpdate,
  EngramPrompt,
  EngramSearchParams,
  EngramSession,
  EngramSessionSummary,
  EngramStats
} from '@models/engram';

// Engram v2 scopes project-aware endpoints to the project of the server's working
// directory unless the request names a project or sets all_projects. Older versions
// ignore the parameter.
// biome-ignore lint/style/useNamingConvention: Engram query parameter
const ALL_PROJECTS = { all_projects: true } as const;

const projectScope = (project?: string) => (project ? { project } : ALL_PROJECTS);

// Upper bound for the observation list the dashboard derives sessions/topics/timeline from
const ALL_OBSERVATIONS_LIMIT = 5000;

export const engramService = {
  health: async (): Promise<EngramHealth> => {
    const { data } = await engramApi.get<EngramHealth>('/health');
    return data;
  },

  stats: async (): Promise<EngramStats> => {
    const { data } = await engramApi.get<EngramStats>('/stats', { params: ALL_PROJECTS });
    return data;
  },

  search: async (params: EngramSearchParams): Promise<EngramObservation[]> => {
    const { data } = await engramApi.get<EngramObservation[] | null>('/search', {
      params: { ...params, ...(params.project ? {} : ALL_PROJECTS) }
    });
    return data ?? [];
  },

  context: async (project?: string): Promise<EngramContext> => {
    const { data } = await engramApi.get<EngramContext>('/context', {
      params: projectScope(project)
    });
    return data;
  },

  deleteObservation: async (id: number): Promise<void> => {
    await engramApi.delete(`/observations/${id}`);
  },

  updateObservation: async (id: number, data: EngramObservationUpdate): Promise<EngramObservation> => {
    const { data: updated } = await engramApi.patch<EngramObservation>(`/observations/${id}`, data);
    return updated;
  },

  /**
   * Fetches observations across all projects, newest first. Uses /observations/recent because
   * /search caps every response at the server's max search results (20 by default).
   */
  allObservations: async (): Promise<EngramObservation[]> => {
    const { data } = await engramApi.get<EngramObservation[] | null>('/observations/recent', {
      params: { ...ALL_PROJECTS, limit: ALL_OBSERVATIONS_LIMIT }
    });
    return data ?? [];
  },

  /** Derives sessions from observations grouped by session_id. */
  sessions: async (): Promise<EngramSession[]> => {
    const all = await engramService.allObservations();
    const map = new Map<string, { project: string; obs: EngramObservation[] }>();

    for (const obs of all) {
      const entry = map.get(obs.session_id) ?? { project: obs.project, obs: [] };
      entry.obs.push(obs);
      map.set(obs.session_id, entry);
    }

    return Array.from(map.entries())
      .map(([sessionId, data]) => {
        const sorted = [...data.obs].sort((a, b) => a.created_at.localeCompare(b.created_at));
        const dateMatch = sessionId.match(/-(\d{8})-/);
        const agentName = dateMatch
          ? sessionId.substring(0, dateMatch.index ?? 0)
          : sessionId.startsWith('manual-save-')
            ? 'manual'
            : sessionId;
        const date = sorted.at(-1)?.created_at ?? '';
        const latestTitle = sorted.at(-1)?.title ?? '';
        // Derive unique types (preserve insertion order, limit noise)
        const types = Array.from(new Set(sorted.map((o) => o.type)));
        // Pick first non-null topic_key as the representative one
        const topicKey = sorted.find((o) => o.topic_key)?.topic_key ?? undefined;
        return {
          sessionId,
          agentName,
          project: data.project,
          date,
          observationCount: sorted.length,
          latestTitle,
          types,
          topicKey,
          observations: sorted
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  /** Collects all reachable observation IDs. */
  collectAllIds: async (): Promise<number[]> => {
    const all = await engramService.allObservations();
    return all.map((obs) => obs.id);
  },

  /** Deletes all reachable observations. Returns count of deleted items. */
  resetAll: async (): Promise<number> => {
    const ids = await engramService.collectAllIds();
    await Promise.allSettled(ids.map((id) => engramService.deleteObservation(id)));
    return ids.length;
  },

  /** Fetches ALL sessions from the backend (includes empty ones). */
  recentSessions: async (limit = 500): Promise<EngramSessionSummary[]> => {
    const { data } = await engramApi.get<EngramSessionSummary[]>('/sessions/recent', {
      params: { ...ALL_PROJECTS, limit }
    });
    return data ?? [];
  },

  /** Fetches recent prompts from the backend. */
  recentPrompts: async (limit = 200): Promise<EngramPrompt[]> => {
    const { data } = await engramApi.get<EngramPrompt[]>('/prompts/recent', {
      params: { ...ALL_PROJECTS, limit }
    });
    return data ?? [];
  },

  /** Hard-deletes a session (only succeeds if it has no observations). */
  deleteSession: async (id: string): Promise<void> => {
    await engramApi.delete(`/sessions/${encodeURIComponent(id)}`);
  },

  /** Hard-deletes a single prompt by ID. */
  deletePrompt: async (id: number): Promise<void> => {
    await engramApi.delete(`/prompts/${id}`);
  },

  /** Exports all Engram data as JSON. */
  exportAll: async (): Promise<Blob> => {
    const { data } = await engramApi.get<Blob>('/export', {
      params: ALL_PROJECTS,
      responseType: 'blob',
      timeout: 0
    });
    return data;
  },

  /** Imports Engram data from a JSON file. Sends the file directly to avoid doubling memory. */
  importData: async (file: File): Promise<void> => {
    await engramApi.post('/import', file, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000
    });
  },

  /** Merges all observations from one project into another. */
  mergeProjects: async (from: string, to: string): Promise<void> => {
    await engramApi.post('/projects/migrate', { from, to }, { timeout: 60_000 });
  }
};
