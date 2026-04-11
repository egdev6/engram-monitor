import { SearchInput } from '@atoms/search-input';
import { FilterSelect } from '@atoms/filter-select';
import { BackButton } from '@atoms/back-button';
import { EmptyState } from '@atoms/empty-state';
import { ObservationRow } from '@molecules/observation-row';
import { MarkdownPanel } from '@molecules/markdown-panel';
import { ClearFiltersBar } from '@molecules/clear-filters-bar';
import { SessionDetailCard } from '@organisms/session-detail-card';
import { type FC, useMemo, useState } from 'react';
import type { EngramObservation } from '@models/engram';
import type { SessionDetailViewProps } from './types';

export const SessionDetailView: FC<SessionDetailViewProps> = ({ session: s, allProjects, onBack }) => {
  const [selected, setSelected] = useState<EngramObservation | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    let result = s.observations;
    if (typeFilter) result = result.filter((o) => o.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        o.title.toLowerCase().includes(q) ||
        o.content.toLowerCase().includes(q) ||
        (o.topic_key?.toLowerCase().includes(q) ?? false),
      );
    }
    return result;
  }, [s.observations, typeFilter, search]);

  const hasActiveFilters = search || typeFilter;
  const uniqueTypes = useMemo(
    () => [...new Set(s.observations.map((o) => o.type))],
    [s.observations],
  );

  const typeOptions = [
    { value: '', label: 'All types' },
    ...uniqueTypes.map((t) => ({ value: t, label: t })),
  ];

  return (
    <div className='w-full max-w-275 flex flex-col gap-5'>

      {/* ── Back + breadcrumb ── */}
      <div className='flex items-center gap-3'>
        <BackButton onClick={onBack} />
        <span className='text-[12px] font-mono text-gray-light-500 dark:text-gray-dark-300'>Sessions /</span>
        <span className='text-[12px] font-mono text-text-light dark:text-text-dark truncate'>{s.agentName}</span>
      </div>

      {/* ── Session metadata card ── */}
      <SessionDetailCard session={s} allProjects={allProjects} />

      {/* ── Filter bar ── */}
      <div className='flex flex-col gap-3 rounded-lg border border-gray-light-300 dark:border-gray-dark-700 bg-gray-light-100 dark:bg-gray-dark-800 px-4 py-3'>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder='Search by title, content, topic…'
          className='bg-transparent border-gray-light-300 dark:border-gray-dark-700'
        />

        <div className='flex items-center gap-3 flex-wrap'>
          <FilterSelect
            label='type'
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            className='bg-transparent border-gray-light-300 dark:border-gray-dark-700'
          />

          {hasActiveFilters && (
            <div className='ml-auto'>
              <ClearFiltersBar
                shown={filtered.length}
                total={s.observations.length}
                label='observations'
                onClear={() => { setSearch(''); setTypeFilter(''); }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Observations list ── */}
      {filtered.length === 0
        ? <EmptyState message={hasActiveFilters ? 'No observations match the current filters' : 'No observations found'} />
        : (
          <div className='flex flex-col gap-1.5'>
            {filtered.map((obs) => (
              <ObservationRow key={obs.id} observation={obs} onClick={setSelected} showTime />
            ))}
          </div>
        )
      }

      {selected && <MarkdownPanel observation={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};
