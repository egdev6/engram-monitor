import { cn } from '@helpers/utils';
import { timeAgo } from '@helpers/time';
import { KNOWN_TYPES, INPUT_CLS } from '@constants/engram-types';
import { SearchInput } from '@atoms/search-input';
import { FilterSelect } from '@atoms/filter-select';
import { EmptyState } from '@atoms/empty-state';
import { IconButton } from '@atoms/icon-button';
import { ClearFiltersBar } from '@molecules/clear-filters-bar';
import { SessionCard } from '@organisms/session-card';
import { Trash2, Folder, Clock, Ghost } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import type { SessionsTabProps } from './types';

const SessionsTab: FC<SessionsTabProps> = ({
  sessions,
  sessionSummaries,
  loading,
  allProjects,
  onDeleteEmptySession,
  isDeletingSession,
}) => {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sessions with observations (derived from allObservations)
  const filtered = useMemo(() => {
    let result = sessions;
    if (projectFilter) result = result.filter((s) => s.project === projectFilter);
    if (typeFilter)    result = result.filter((s) => s.types.includes(typeFilter));
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((s) => new Date(s.date).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86_399_999;
      result = result.filter((s) => new Date(s.date).getTime() <= to);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.agentName.toLowerCase().includes(q) ||
        s.project.toLowerCase().includes(q) ||
        s.latestTitle.toLowerCase().includes(q) ||
        (s.topicKey?.toLowerCase().includes(q) ?? false) ||
        s.sessionId.toLowerCase().includes(q),
      );
    }
    return result;
  }, [sessions, projectFilter, typeFilter, dateFrom, dateTo, search]);

  // Empty sessions: from backend summaries, no observations, not already in derived sessions
  const derivedIds = useMemo(() => new Set(sessions.map((s) => s.sessionId)), [sessions]);
  const emptySessions = useMemo(
    () => sessionSummaries.filter((s) => s.observation_count === 0 && !derivedIds.has(s.id)),
    [sessionSummaries, derivedIds],
  );

  if (loading && sessions.length === 0) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => (
          <div
            key={k}
            className='h-44 rounded-lg bg-gray-light-200 dark:bg-gray-dark-800 animate-pulse border border-gray-light-300 dark:border-gray-dark-700'
          />
        ))}
      </div>
    );
  }

  const hasActiveFilters = search || projectFilter || typeFilter || dateFrom || dateTo;

  const projectOptions = [
    { value: '', label: 'All projects' },
    ...allProjects.map((p) => ({ value: p, label: p })),
  ];

  const typeOptions = [
    { value: '', label: 'All types' },
    ...KNOWN_TYPES.map((t) => ({ value: t, label: t })),
  ];

  return (
    <>
      {/* ── Filter bar ── */}
      <div className='flex flex-col gap-3 pb-1'>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder='Search by agent, project, topic, title…'
        />

        <div className='flex items-center gap-3 flex-wrap'>
          <FilterSelect
            label='project'
            value={projectFilter}
            onChange={setProjectFilter}
            options={projectOptions}
          />
          <FilterSelect
            label='type'
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
          />

          {/* Date range */}
          <div className='flex items-center gap-1.5'>
            <div className='flex items-center gap-1.5'>
              <span className='text-[10px] font-mono uppercase tracking-widest text-gray-light-600 dark:text-gray-dark-300 shrink-0'>
                from
              </span>
              <input
                type='date'
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
                className={cn(INPUT_CLS, 'py-1.5')}
              />
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='text-[10px] font-mono uppercase tracking-widest text-gray-light-600 dark:text-gray-dark-300 shrink-0'>
                to
              </span>
              <input
                type='date'
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className={cn(INPUT_CLS, 'py-1.5')}
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <ClearFiltersBar
            shown={filtered.length}
            total={sessions.length}
            label='sessions'
            onClear={() => {
              setSearch('');
              setProjectFilter('');
              setTypeFilter('');
              setDateFrom('');
              setDateTo('');
            }}
          />
        )}
      </div>

      {/* ── Sessions with observations ── */}
      {filtered.length === 0 ? (
        <EmptyState message={hasActiveFilters ? 'No sessions match the current filters' : 'No sessions found'} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 items-start'>
          {filtered.map((s) => (
            <SessionCard key={s.sessionId} session={s} allProjects={allProjects} />
          ))}
        </div>
      )}

      {/* ── Empty sessions section ── */}
      {emptySessions.length > 0 && (
        <div className='mt-6 flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <Ghost size={14} className='text-gray-light-500 dark:text-gray-dark-300' />
            <span className='text-[10px] font-mono uppercase tracking-widest text-gray-light-500 dark:text-gray-dark-300'>
              Empty sessions ({emptySessions.length})
            </span>
          </div>

          <div className='flex flex-col gap-2'>
            {emptySessions.map((s) => (
              <div
                key={s.id}
                className='group flex items-center gap-3 rounded-lg border px-4 py-3
                           bg-gray-light-100 dark:bg-gray-dark-800
                           border-gray-light-300 dark:border-gray-dark-700
                           hover:border-accent/30 transition-colors'
              >
                <div className='flex-1 min-w-0 flex items-center gap-4'>
                  <span className='text-xs font-mono text-text-light dark:text-text-dark truncate max-w-[260px]'>
                    {s.id}
                  </span>
                  {s.project && (
                    <span className='flex items-center gap-1 text-[10px] font-mono text-gray-light-600 dark:text-gray-dark-300 truncate'>
                      <Folder size={10} className='shrink-0' />
                      <span className='truncate'>{s.project}</span>
                    </span>
                  )}
                  <span className='flex items-center gap-1 text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300 shrink-0'>
                    <Clock size={10} />
                    {timeAgo(s.started_at)}
                  </span>
                </div>

                <IconButton
                  icon={Trash2}
                  size={14}
                  label='Delete empty session'
                  disabled={isDeletingSession}
                  onClick={() => onDeleteEmptySession(s.id)}
                  className='opacity-0 group-hover:opacity-100 shrink-0
                             hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40'
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SessionsTab;
