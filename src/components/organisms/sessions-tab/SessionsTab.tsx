import { cn } from '@helpers/utils';
import { KNOWN_TYPES, INPUT_CLS } from '@constants/engram-types';
import { SearchInput } from '@atoms/search-input';
import { FilterSelect } from '@atoms/filter-select';
import { EmptyState } from '@atoms/empty-state';
import { ClearFiltersBar } from '@molecules/clear-filters-bar';
import { SessionCard } from '@organisms/session-card';
import { type FC, useMemo, useState } from 'react';
import type { SessionsTabProps } from './types';

const SessionsTab: FC<SessionsTabProps> = ({
  sessions,
  loading,
  allProjects,
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
    </>
  );
};

export default SessionsTab;
