import { EmptyState } from '@atoms/empty-state';
import { FilterSelect } from '@atoms/filter-select';
import { SearchInput } from '@atoms/search-input';
import { TypeBadge } from '@atoms/type-badge';
import { KNOWN_TYPES, TYPE_COLORS } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import type { EngramObservation } from '@models/engram';
import { MarkdownPanel } from '@molecules/markdown-panel';
import { FolderOpen } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import type { TimelineTabProps } from './types';

/**
 * Derives a solid bg class from TYPE_COLORS (which use bg-color/20 format).
 * e.g. "bg-blue/20 text-blue border-blue/30" → "bg-blue"
 */
function getDotColor(type: string): string {
  const colorEntry = TYPE_COLORS[type];
  if (!colorEntry) return 'bg-gray-dark-400';
  const bgMatch = colorEntry.match(/bg-([^\s/]+)/);
  return bgMatch ? `bg-${bgMatch[1]}` : 'bg-gray-dark-400';
}

interface DayGroup {
  date: string;
  label: string;
  observations: EngramObservation[];
}

/** Formats an ISO date string to a local YYYY-MM-DD key. */
function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function groupByDay(observations: EngramObservation[]): DayGroup[] {
  const sorted = [...observations].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const map = new Map<string, EngramObservation[]>();

  for (const obs of sorted) {
    const date = toLocalDateKey(obs.created_at);
    const list = map.get(date) ?? [];
    list.push(obs);
    map.set(date, list);
  }

  const now = new Date();
  const today = toLocalDateKey(now.toISOString());
  const yesterday = toLocalDateKey(new Date(now.getTime() - 86_400_000).toISOString());

  return Array.from(map.entries()).map(([date, obs]) => ({
    date,
    label: date === today ? 'Today' : date === yesterday ? 'Yesterday' : formatDate(date),
    observations: obs
  }));
}

function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

const TimelineTab: FC<TimelineTabProps> = ({ observations, loading, allProjects }) => {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState<EngramObservation | null>(null);

  const filtered = useMemo(() => {
    let result = observations;
    if (projectFilter) {
      result = result.filter((o) => o.project === projectFilter);
    }
    if (typeFilter) {
      result = result.filter((o) => o.type === typeFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.content.toLowerCase().includes(q) ||
          (o.topic_key?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [observations, projectFilter, typeFilter, search]);

  const days = useMemo(() => groupByDay(filtered), [filtered]);

  const projectOptions = [{ value: '', label: 'All projects' }, ...allProjects.map((p) => ({ value: p, label: p }))];
  const typeOptions = [{ value: '', label: 'All types' }, ...KNOWN_TYPES.map((t) => ({ value: t, label: t }))];

  if (loading && observations.length === 0) {
    return (
      <div className='flex flex-col gap-3'>
        {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => (
          <div
            key={k}
            className={cn(
              'h-14 rounded-lg animate-pulse border',
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
        <SearchInput value={search} onChange={setSearch} placeholder='Search by title, content, topic…' />
        <div className='flex items-center gap-3 flex-wrap'>
          <FilterSelect label='project' value={projectFilter} onChange={setProjectFilter} options={projectOptions} />
          <FilterSelect label='type' value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
          <span className='text-[11px] font-mono text-gray-light-500 dark:text-gray-dark-300 ml-auto'>
            {filtered.length} observation{filtered.length !== 1 ? 's' : ''} across {days.length} day
            {days.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Timeline */}
      {days.length === 0 ? (
        <EmptyState
          message={search || projectFilter || typeFilter ? 'No observations match the filters' : 'No observations yet'}
        />
      ) : (
        <div className='flex flex-col gap-0'>
          {days.map((day, dayIdx) => (
            <div key={day.date}>
              {/* Day header */}
              <div className='flex items-center gap-3 py-3'>
                <div className='w-3 h-3 rounded-full bg-accent/80 ring-2 ring-accent/20 shrink-0' />
                <h3 className='text-[13px] font-semibold text-text-light dark:text-text-dark'>{day.label}</h3>
                <span className='text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                  {day.observations.length} obs
                </span>
                <div className='flex-1 h-px bg-gray-light-300 dark:bg-gray-dark-700' />
              </div>

              {/* Observations for this day */}
              <div className='ml-1.5 border-l-2 border-gray-light-300 dark:border-gray-dark-700 pl-6 flex flex-col gap-0'>
                {day.observations.map((obs, obsIdx) => {
                  const dotColor = getDotColor(obs.type);
                  const isLast = obsIdx === day.observations.length - 1 && dayIdx === days.length - 1;
                  return (
                    <button
                      key={obs.id}
                      type='button'
                      onClick={() => setSelected(obs)}
                      className={cn(
                        'relative flex items-start gap-3 py-2.5 px-3 -ml-9 text-left rounded-lg cursor-pointer',
                        'hover:bg-gray-light-200/50 dark:hover:bg-gray-dark-700/50 transition-colors',
                        isLast && 'mb-1'
                      )}
                    >
                      {/* Dot on the line */}
                      <div
                        className={cn(
                          'w-2.5 h-2.5 rounded-full mt-1 shrink-0 ring-2 ring-background-light dark:ring-background-dark',
                          dotColor
                        )}
                      />

                      {/* Content */}
                      <div className='flex flex-col gap-1 min-w-0 flex-1'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='text-[12px] text-text-light dark:text-text-dark leading-snug'>
                            {obs.title}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                            {formatTime(obs.created_at)}
                          </span>
                          <TypeBadge type={obs.type} />
                          {obs.project && (
                            <span className='inline-flex items-center gap-1 text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                              <FolderOpen size={9} className='opacity-60' />
                              {obs.project}
                            </span>
                          )}
                          {obs.topic_key && (
                            <span className='text-[9px] font-mono text-gray-light-400 dark:text-gray-dark-300'>
                              {obs.topic_key}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <MarkdownPanel observation={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default TimelineTab;
