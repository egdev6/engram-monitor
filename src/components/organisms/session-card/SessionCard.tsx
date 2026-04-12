import { TypeBadge } from '@atoms/type-badge';
import { projectColor, timeAgo } from '@helpers/time';
import { cn } from '@helpers/utils';
import { Bot, Folder, Layers, Tag } from 'lucide-react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SessionCardProps } from './types';

const SessionCard: FC<SessionCardProps> = ({ session: s, allProjects }) => {
  const navigate = useNavigate();
  return (
    <button
      type='button'
      onClick={() => navigate(`/sessions/${encodeURIComponent(s.sessionId)}`)}
      className={cn(
        'w-full h-full rounded-lg border px-4 py-4 flex flex-col justify-between gap-3 text-left transition-colors',
        'bg-gray-light-100 dark:bg-gray-dark-800',
        'border-gray-light-300 dark:border-gray-dark-700',
        'hover:border-accent/40 hover:bg-gray-light-200 dark:hover:bg-gray-dark-700'
      )}
    >
      {/* ── Top section ── */}
      <div className='flex flex-col gap-2'>
        {/* Row 1: agent + project badges */}
        <div className='w-full flex items-center justify-between gap-1.5'>
          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border bg-accent/10 text-accent border-accent/30 min-w-0 max-w-[55%]'>
            <Bot size={9} className='shrink-0' />
            <span className='truncate'>{s.agentName}</span>
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border min-w-0 max-w-[40%]',
              projectColor(s.project, allProjects)
            )}
          >
            <Folder size={9} className='shrink-0' />
            <span className='truncate'>{s.project}</span>
          </span>
        </div>

        {/* Row 2: latest title */}
        <p
          className={cn(
            'text-[13px] font-mono leading-snug line-clamp-2',
            s.latestTitle ? 'text-text-light dark:text-text-dark' : 'text-gray-light-400 dark:text-gray-dark-300 italic'
          )}
        >
          {s.latestTitle || 'no title'}
        </p>

        {/* Row 3: type badges */}
        {s.types.length > 0 && (
          <div className='flex items-center gap-1 flex-wrap'>
            {s.types.slice(0, 4).map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
            {s.types.length > 4 && (
              <span className='text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                +{s.types.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom section ── */}
      <div className='flex flex-col gap-1.5'>
        {/* topic_key */}
        <p className='text-[10px] font-mono truncate text-gray-light-500 dark:text-gray-dark-300'>
          {s.topicKey ? (
            <span className='inline-flex items-center gap-1'>
              <Tag size={9} className='text-gray-light-400 dark:text-gray-dark-300 shrink-0' />
              {s.topicKey}
            </span>
          ) : (
            <span className='text-gray-light-300 dark:text-gray-dark-700'>—</span>
          )}
        </p>
        {/* time + obs count */}
        <div className='flex items-center justify-between gap-2'>
          <span className='text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
            {timeAgo(s.date)}
            <span className='text-gray-light-400 dark:text-gray-dark-300 mx-1'>·</span>
            {new Date(s.date).toLocaleDateString()}
          </span>
          <span className='inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-gray-light-200 dark:bg-gray-dark-700 border-gray-light-400 dark:border-gray-dark-400 text-gray-light-600 dark:text-gray-dark-300 shrink-0'>
            <Layers size={9} />
            {s.observationCount}
          </span>
        </div>
      </div>
    </button>
  );
};

export default SessionCard;
