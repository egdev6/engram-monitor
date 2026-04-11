export type EngramObservationType =
  | 'pattern'
  | 'decision'
  | 'discovery'
  | 'handoff'
  | 'summary'
  | 'prompt'
  | 'bugfix'
  | 'architecture'
  | 'config'
  | 'learning'
  | string;

export type EngramScope = 'project' | 'personal' | 'global' | string;

export interface EngramObservation {
  id: number;
  session_id: string;
  type: EngramObservationType;
  title: string;
  content: string;
  project: string;
  scope: EngramScope;
  topic_key?: string | null;
  revision_count: number;
  duplicate_count: number;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
  rank?: number;
}

export interface EngramStats {
  total_sessions: number;
  total_observations: number;
  total_prompts: number;
  projects: string[];
}

export interface EngramHealth {
  service: string;
  status: string;
  version: string;
}

export interface EngramContext {
  context: string;
}

export interface EngramSession {
  sessionId: string;
  agentName: string;
  project: string;
  date: string;
  observationCount: number;
  latestTitle: string;
  /** Unique observation types present in this session */
  types: EngramObservationType[];
  /** Most relevant topic_key found in this session's observations, if any */
  topicKey?: string;
  observations: EngramObservation[];
}

export interface EngramSearchParams {
  q: string;
  type?: EngramObservationType;
  project?: string;
  scope?: EngramScope;
  limit?: number;
}
