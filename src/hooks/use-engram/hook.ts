import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { engramService } from '@services/engram';
import type { EngramFilters } from './types';

const POLL_INTERVAL = 2_000;
const SEARCH_DEBOUNCE_MS = 350;

export const useEngramHealth = () =>
  useQuery({
    queryKey: ['engram', 'health'],
    queryFn: engramService.health,
    refetchInterval: POLL_INTERVAL,
    retry: false
  });

export const useEngramStats = () =>
  useQuery({
    queryKey: ['engram', 'stats'],
    queryFn: engramService.stats,
    refetchInterval: POLL_INTERVAL
  });

/** Debounces the query string so the API is not hit on every keystroke. */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    timerRef.current = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timerRef.current);
  }, [value, delay]);
  return debounced;
}

export const useEngramSearch = (filters: EngramFilters) => {
  const debouncedQuery = useDebounced(filters.query, SEARCH_DEBOUNCE_MS);
  const { project, type, scope, limit } = filters;
  return useQuery({
    queryKey: ['engram', 'search', { ...filters, query: debouncedQuery }],
    queryFn: () =>
      engramService.search({
        q: debouncedQuery || 'a',
        ...(project ? { project } : {}),
        ...(type ? { type } : {}),
        ...(scope ? { scope } : {}),
        limit: limit || 50
      }),
    refetchInterval: POLL_INTERVAL,
    placeholderData: (prev) => prev
  });
};

export const useEngramContext = (project?: string) =>
  useQuery({
    queryKey: ['engram', 'context', project],
    queryFn: () => engramService.context(project),
    refetchInterval: POLL_INTERVAL
  });

export const useEngramSessions = () =>
  useQuery({
    queryKey: ['engram', 'sessions'],
    queryFn: () => engramService.sessions(),
    refetchInterval: POLL_INTERVAL,
    placeholderData: (prev) => prev
  });

export const useEngramReset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: engramService.resetAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engram'] });
    }
  });
};

/** All sessions from the backend — including empty ones (observation_count = 0). */
export const useEngramSessionSummaries = () =>
  useQuery({
    queryKey: ['engram', 'session-summaries'],
    queryFn: () => engramService.recentSessions(),
    refetchInterval: POLL_INTERVAL,
    placeholderData: (prev) => prev
  });

/** Recent prompts. */
export const useEngramPrompts = () =>
  useQuery({
    queryKey: ['engram', 'prompts'],
    queryFn: () => engramService.recentPrompts(),
    refetchInterval: POLL_INTERVAL,
    placeholderData: (prev) => prev
  });

/** Delete a single session (only works if observation_count = 0). */
export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => engramService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engram', 'session-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['engram', 'stats'] });
    },
  });
};

/** Delete a single prompt by ID. */
export const useDeletePrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => engramService.deletePrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engram', 'prompts'] });
      queryClient.invalidateQueries({ queryKey: ['engram', 'stats'] });
    },
  });
};
