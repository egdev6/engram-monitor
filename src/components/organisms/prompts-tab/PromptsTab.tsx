import { EmptyState } from '@atoms/empty-state';
import { IconButton } from '@atoms/icon-button';
import { SearchInput } from '@atoms/search-input';
import { timeAgo } from '@helpers/time';
import { ClearFiltersBar } from '@molecules/clear-filters-bar';
import { Clock, Folder, Link, Trash2 } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import type { PromptsTabProps } from './types';

const PromptsTab: FC<PromptsTabProps> = ({ prompts, loading, onDelete, isDeleting }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) {
      return prompts;
    }
    const q = search.toLowerCase();
    return prompts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.project.toLowerCase().includes(q) ||
        p.session_id.toLowerCase().includes(q)
    );
  }, [prompts, search]);

  if (loading && prompts.length === 0) {
    return (
      <div className='flex flex-col gap-2'>
        {Array.from({ length: 8 }, (_, i) => `sk-${i}`).map((k) => (
          <div
            key={k}
            className='h-16 rounded-lg bg-gray-light-200 dark:bg-gray-dark-800 animate-pulse border border-gray-light-300 dark:border-gray-dark-700'
          />
        ))}
      </div>
    );
  }

  const hasActiveFilters = !!search;

  return (
    <>
      {/* ── Filter bar ── */}
      <div className='flex flex-col gap-3 pb-1'>
        <SearchInput value={search} onChange={setSearch} placeholder='Search prompts by content, project, session…' />

        {hasActiveFilters && (
          <ClearFiltersBar
            shown={filtered.length}
            total={prompts.length}
            label='prompts'
            onClear={() => setSearch('')}
          />
        )}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <EmptyState message={hasActiveFilters ? 'No prompts match the search' : 'No prompts found'} />
      ) : (
        <div className='flex flex-col gap-2'>
          {filtered.map((p) => (
            <div
              key={p.id}
              className='group flex items-start gap-3 rounded-lg border px-4 py-3
                         bg-gray-light-100 dark:bg-gray-dark-800
                         border-gray-light-400 dark:border-gray-dark-600
                         hover:border-accent/40 transition-colors'
            >
              {/* Content */}
              <p className='flex-1 min-w-0 text-sm text-text-light dark:text-text-dark line-clamp-2 leading-relaxed'>
                {p.content}
              </p>

              {/* Meta */}
              <div className='shrink-0 flex flex-col items-end gap-1.5 min-w-30'>
                {p.project && (
                  <span className='flex items-center gap-1 text-[10px] text-gray-light-600 dark:text-gray-dark-300 truncate max-w-27.5'>
                    <Folder size={10} className='shrink-0' />
                    <span className='truncate'>{p.project}</span>
                  </span>
                )}
                <span className='flex items-center gap-1 text-[10px] text-gray-light-500 dark:text-gray-dark-300'>
                  <Clock size={10} className='shrink-0' />
                  {timeAgo(p.created_at)}
                </span>
                <a
                  href={`/sessions/${encodeURIComponent(p.session_id)}`}
                  className='flex items-center gap-1 text-[10px] text-accent/70 hover:text-accent transition-colors truncate max-w-27.5'
                  title={p.session_id}
                >
                  <Link size={10} className='shrink-0' />
                  <span className='truncate'>{p.session_id}</span>
                </a>
              </div>

              {/* Delete button */}
              <IconButton
                icon={Trash2}
                size={14}
                label='Delete prompt'
                disabled={isDeleting}
                onClick={() => onDelete(p.id)}
                className='shrink-0 self-center hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40'
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PromptsTab;
