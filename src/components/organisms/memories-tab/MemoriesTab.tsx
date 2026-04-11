import { KNOWN_TYPES } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import { SearchInput } from '@atoms/search-input';
import { FilterSelect } from '@atoms/filter-select';
import { EmptyState } from '@atoms/empty-state';
import { ObservationRow } from '@molecules/observation-row';
import { MarkdownPanel } from '@molecules/markdown-panel';
import { type FC, useState } from 'react';
import type { EngramObservation } from '@models/engram';
import type { MemoriesTabProps } from './types';

const MemoriesTab: FC<MemoriesTabProps> = ({ observations, filters, onFiltersChange, isLoading, projects }) => {
  const [selected, setSelected] = useState<EngramObservation | null>(null);

  const projectOptions = [
    { value: '', label: 'All projects' },
    ...projects.map((p) => ({ value: p, label: p })),
  ];

  const typeOptions = [
    { value: '', label: 'All' },
    ...KNOWN_TYPES.map((t) => ({ value: t, label: t })),
  ];

  const scopeOptions = [
    { value: '', label: 'All' },
    { value: 'project', label: 'project' },
    { value: 'personal', label: 'personal' },
  ];

  const limitOptions = [20, 50, 100].map((n) => ({ value: String(n), label: String(n) }));

  const hasActiveFilters = filters.project || filters.type || filters.scope;

  return (
    <>
      {/* ── Filter panel ── */}
      <div className='flex flex-col gap-3 rounded-lg border border-gray-light-300 dark:border-gray-dark-700 bg-gray-light-100 dark:bg-gray-dark-800 px-4 py-3'>
        <SearchInput
          value={filters.query}
          onChange={(query) => onFiltersChange({ query })}
          placeholder='Search by title, content, topic…'
          className='bg-transparent border-gray-light-300 dark:border-gray-dark-700'
        />

        <div className='flex items-center gap-1.5 flex-wrap'>
          <FilterSelect
            label='project'
            value={filters.project}
            onChange={(project) => onFiltersChange({ project })}
            options={projectOptions}
            className='bg-transparent border-gray-light-300 dark:border-gray-dark-700'
          />
          <FilterSelect
            label='type'
            value={filters.type}
            onChange={(type) => onFiltersChange({ type })}
            options={typeOptions}
            className='bg-transparent border-gray-light-300 dark:border-gray-dark-700'
          />
          <FilterSelect
            label='scope'
            value={filters.scope}
            onChange={(scope) => onFiltersChange({ scope })}
            options={scopeOptions}
            className='bg-transparent border-gray-light-300 dark:border-gray-dark-700'
          />
          <div className='ml-auto'>
            <FilterSelect
              label='limit'
              value={String(filters.limit)}
              onChange={(limit) => onFiltersChange({ limit: Number(limit) })}
              options={limitOptions}
              className='bg-transparent border-gray-light-300 dark:border-gray-dark-700'
            />
          </div>
        </div>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className='flex items-center gap-2 flex-wrap pt-0.5'>
            <span className='text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>Active:</span>
            {filters.project && (
              <button
                type='button'
                onClick={() => onFiltersChange({ project: '' })}
                className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20'
              >
                project: {filters.project} ✕
              </button>
            )}
            {filters.type && (
              <button
                type='button'
                onClick={() => onFiltersChange({ type: '' })}
                className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20'
              >
                type: {filters.type} ✕
              </button>
            )}
            {filters.scope && (
              <button
                type='button'
                onClick={() => onFiltersChange({ scope: '' })}
                className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20'
              >
                scope: {filters.scope} ✕
              </button>
            )}
            <button
              type='button'
              onClick={() => onFiltersChange({ project: '', type: '', scope: '' })}
              className='text-[11px] font-mono text-accent hover:underline ml-1'
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Results count ── */}
      {!isLoading && (
        <p className='text-[11px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
          {observations.length} result{observations.length !== 1 ? 's' : ''}
          {filters.query ? ` for "${filters.query}"` : ''}
        </p>
      )}

      {/* ── List ── */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 items-start'>
        {isLoading && observations.length === 0
          ? Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => (
              <div
                key={k}
                className={cn(
                  'h-20 rounded-lg animate-pulse border',
                  'bg-gray-light-200 dark:bg-gray-dark-800',
                  'border-gray-light-300 dark:border-gray-dark-700',
                )}
              />
            ))
          : observations.length === 0
            ? <EmptyState message='No memories found' />
            : observations.map((obs) => (
                <ObservationRow key={obs.id} observation={obs} onClick={setSelected} />
              ))
        }
      </div>

      {selected && <MarkdownPanel observation={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default MemoriesTab;
