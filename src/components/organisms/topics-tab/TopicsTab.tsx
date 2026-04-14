import { EmptyState } from '@atoms/empty-state';
import { FilterSelect } from '@atoms/filter-select';
import { SearchInput } from '@atoms/search-input';
import { TypeBadge } from '@atoms/type-badge';
import { cn } from '@helpers/utils';
import type { EngramObservation, EngramObservationType } from '@models/engram';
import { MarkdownPanel } from '@molecules/markdown-panel';
import { ChevronDown, ChevronRight, FolderOpen, Tag } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import type { TopicsTabProps } from './types';

interface TopicGroup {
  topicKey: string;
  observations: EngramObservation[];
  projects: string[];
  types: EngramObservationType[];
  latestDate: string;
  /** Precomputed lowercase search text for filtering performance. */
  searchText: string;
}

const TopicsTab: FC<TopicsTabProps> = ({ observations, loading, allProjects }) => {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<EngramObservation | null>(null);

  const groups = useMemo(() => {
    // Only observations with a topic_key
    const withTopic = observations.filter((o) => o.topic_key);
    const map = new Map<string, EngramObservation[]>();

    for (const obs of withTopic) {
      const key = obs.topic_key as string;
      const list = map.get(key) ?? [];
      list.push(obs);
      map.set(key, list);
    }

    const result: TopicGroup[] = [];
    for (const [topicKey, obs] of map) {
      const sorted = [...obs].sort((a, b) => a.created_at.localeCompare(b.created_at));
      const searchText = [topicKey, ...sorted.map((o) => `${o.title} ${o.content}`)].join(' ').toLowerCase();
      result.push({
        topicKey,
        observations: sorted,
        projects: Array.from(new Set(sorted.map((o) => o.project))),
        types: Array.from(new Set(sorted.map((o) => o.type))),
        latestDate: sorted.at(-1)?.created_at ?? '',
        searchText
      });
    }

    return result.sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  }, [observations]);

  const filtered = useMemo(() => {
    let result = groups;
    if (projectFilter) {
      result = result.filter((g) => g.projects.includes(projectFilter));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((g) => g.searchText.includes(q));
    }
    return result;
  }, [groups, projectFilter, search]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const projectOptions = [{ value: '', label: 'All projects' }, ...allProjects.map((p) => ({ value: p, label: p }))];

  if (loading && observations.length === 0) {
    return (
      <div className='flex flex-col gap-3'>
        {Array.from({ length: 4 }, (_, i) => `sk-${i}`).map((k) => (
          <div
            key={k}
            className={cn(
              'h-16 rounded-lg animate-pulse border',
              'bg-gray-light-200 dark:bg-gray-dark-800',
              'border-gray-light-300 dark:border-gray-dark-700'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className='flex flex-col gap-3'>
        <SearchInput value={search} onChange={setSearch} placeholder='Search by topic key, title, content…' />
        <div className='flex items-center gap-3 flex-wrap'>
          <FilterSelect label='project' value={projectFilter} onChange={setProjectFilter} options={projectOptions} />
          <span className='text-[11px] font-mono text-gray-light-500 dark:text-gray-dark-300 ml-auto'>
            {filtered.length} topic{filtered.length !== 1 ? 's' : ''}
            {groups.length !== filtered.length ? ` / ${groups.length} total` : ''}
          </span>
        </div>
      </div>

      {/* Groups */}
      {filtered.length === 0 ? (
        <EmptyState message={search || projectFilter ? 'No topics match the current filters' : 'No topic keys found'} />
      ) : (
        <div className='flex flex-col gap-2'>
          {filtered.map((group, groupIdx) => {
            const isOpen = expanded.has(group.topicKey);
            const panelId = `topic-panel-${groupIdx}`;
            return (
              <div
                key={group.topicKey}
                className={cn(
                  'rounded-lg border overflow-hidden',
                  'border-gray-light-300 dark:border-gray-dark-700',
                  'bg-gray-light-100/50 dark:bg-gray-dark-800/50'
                )}
              >
                {/* Group header */}
                <button
                  type='button'
                  onClick={() => toggleExpand(group.topicKey)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer',
                    'hover:bg-gray-light-200/50 dark:hover:bg-gray-dark-700/50 transition-colors'
                  )}
                >
                  {isOpen ? (
                    <ChevronDown size={14} className='text-gray-light-500 dark:text-gray-dark-300 shrink-0' />
                  ) : (
                    <ChevronRight size={14} className='text-gray-light-500 dark:text-gray-dark-300 shrink-0' />
                  )}

                  <Tag size={12} className='text-accent shrink-0' />

                  <span className='text-[13px] font-mono font-medium text-text-light dark:text-text-dark truncate'>
                    {group.topicKey}
                  </span>

                  <div className='flex items-center gap-1.5 ml-auto shrink-0'>
                    {group.projects.map((p) => (
                      <span
                        key={p}
                        className='inline-flex items-center gap-1 text-[10px] font-mono text-gray-light-600 dark:text-gray-dark-300'
                      >
                        <FolderOpen size={9} className='opacity-60' />
                        {p}
                      </span>
                    ))}
                    <span className='text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300 tabular-nums'>
                      {group.observations.length} obs
                    </span>
                    {group.types.slice(0, 3).map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </button>

                {/* Expanded observations */}
                {isOpen && (
                  <div id={panelId} className='border-t border-gray-light-300 dark:border-gray-dark-700'>
                    {group.observations.map((obs, i) => (
                      <button
                        key={obs.id}
                        type='button'
                        onClick={() => setSelected(obs)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer',
                          'hover:bg-gray-light-200/50 dark:hover:bg-gray-dark-700/50 transition-colors',
                          i > 0 && 'border-t border-gray-light-200 dark:border-gray-dark-700/50'
                        )}
                      >
                        {/* Timeline dot */}
                        <div className='flex flex-col items-center gap-0.5 shrink-0 w-4'>
                          <div className='w-2 h-2 rounded-full bg-accent/60' />
                          {i < group.observations.length - 1 && (
                            <div className='w-px h-3 bg-gray-light-300 dark:bg-gray-dark-600' />
                          )}
                        </div>

                        <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
                          <span className='text-[12px] text-text-light dark:text-text-dark truncate'>
                            {obs.title}
                          </span>
                          <span className='text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                            {new Date(obs.created_at).toLocaleString()}
                          </span>
                        </div>

                        <TypeBadge type={obs.type} />

                        {obs.revision_count > 0 && (
                          <span className='text-[9px] font-mono text-gray-light-400 dark:text-gray-dark-300 shrink-0'>
                            rev {obs.revision_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && <MarkdownPanel observation={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default TopicsTab;
