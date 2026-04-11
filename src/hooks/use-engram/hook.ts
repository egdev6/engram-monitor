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
