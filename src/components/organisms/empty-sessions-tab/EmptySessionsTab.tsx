import { EmptyState } from '@atoms/empty-state';
import { IconButton } from '@atoms/icon-button';
import { SearchInput } from '@atoms/search-input';
import { timeAgo } from '@helpers/time';
import { Clock, Folder, Trash2 } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import type { EmptySessionsTabProps } from './types';

const EmptySessionsTab: FC<EmptySessionsTabProps> = ({ sessionSummaries, loading, onDelete, isDeleting }) => {
  const [search, setSearch] = useState('');

  const emptySessions = useMemo(() => sessionSummaries.filter((s) => s.observation_count === 0), [sessionSummaries]);

  const filtered = useMemo(() => {
    if (!search) {
      return emptySessions;
    }
    const q = search.toLowerCase();
    return emptySessions.filter((s) => s.id.toLowerCase().includes(q) || s.project.toLowerCase().includes(q));
  }, [emptySessions, search]);

  if (loading && emptySessions.length === 0) {
    return (
      <div className='flex flex-col gap-2'>
        {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => (
          <div
            key={k}
            className='h-12 rounded-lg bg-gray-light-200 dark:bg-gray-dark-800 animate-pulse border border-gray-light-300 dark:border-gray-dark-700'
          />
        ))}
      </div>
    );
  }

  const hasActiveFilters = !!search;

  return (
    <>
      <SearchInput value={search} onChange={setSearch} placeholder='Search by session ID or project…' />

      {filtered.length === 0 ? (
        <EmptyState message={hasActiveFilters ? 'No empty sessions match the search' : 'No empty sessions found'} />
      ) : (
        <div className='flex flex-col gap-2'>
          {filtered.map((s) => (
            <div
              key={s.id}
              className='group flex items-center gap-3 rounded-lg border px-4 py-3
                         bg-gray-light-100 dark:bg-gray-dark-800
                         border-gray-light-300 dark:border-gray-dark-700
                         hover:border-accent/30 transition-colors'
            >
              <div className='flex-1 min-w-0 flex items-center gap-4'>
                <span className='text-xs text-text-light dark:text-text-dark truncate max-w-[260px]'>{s.id}</span>
                {s.project && (
                  <span className='flex items-center gap-1 text-[10px] text-gray-light-600 dark:text-gray-dark-300 truncate'>
                    <Folder size={10} className='shrink-0' />
                    <span className='truncate'>{s.project}</span>
                  </span>
                )}
                <span className='flex items-center gap-1 text-[10px] text-gray-light-500 dark:text-gray-dark-300 shrink-0'>
                  <Clock size={10} />
                  {timeAgo(s.started_at)}
                </span>
              </div>

              <IconButton
                icon={Trash2}
                size={14}
                label='Delete empty session'
                disabled={isDeleting}
                onClick={() => onDelete(s.id)}
                className='opacity-0 group-hover:opacity-100 shrink-0
                           hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40'
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EmptySessionsTab;
