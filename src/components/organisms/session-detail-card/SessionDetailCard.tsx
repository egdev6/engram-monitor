import { TypeBadge } from '@atoms/type-badge';
import { projectColor, timeAgo } from '@helpers/time';
import { cn } from '@helpers/utils';
import { Bot, Folder, Layers, Tag } from 'lucide-react';
import type { FC } from 'react';
import type { SessionDetailCardProps } from './types';

const SessionDetailCard: FC<SessionDetailCardProps> = ({ session: s, allProjects }) => (
  <div
    className={cn(
      'rounded-lg border px-5 py-4 flex flex-col gap-3',
      'bg-gray-light-100 dark:bg-gray-dark-800',
      'border-gray-light-300 dark:border-gray-dark-700'
    )}
  >
    {/* Row 1: agent + project + obs count */}
    <div className='flex items-center gap-2 flex-wrap'>
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
      <span className='ml-auto inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-gray-light-200 dark:bg-gray-dark-700 border-gray-light-400 dark:border-gray-dark-400 text-gray-light-600 dark:text-gray-dark-300 shrink-0'>
        <Layers size={9} />
        {s.observationCount} observations
      </span>
    </div>

    {/* Row 2: date + time ago */}
    <p className='text-[11px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
      {new Date(s.date).toLocaleString()} · {timeAgo(s.date)}
    </p>

    {/* Row 3: type badges */}
    {s.types.length > 0 && (
      <div className='flex items-center gap-1.5 flex-wrap'>
        {s.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    )}

    {/* Row 4: topic_key */}
    {s.topicKey && (
      <p className='inline-flex items-center gap-1 text-[11px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
        <Tag size={10} className='text-gray-light-400 dark:text-gray-dark-300 shrink-0' />
        {s.topicKey}
      </p>
    )}

    {/* Row 5: session id */}
    <p className='text-[10px] font-mono text-gray-light-400 dark:text-gray-dark-300 truncate'>{s.sessionId}</p>
  </div>
);

export default SessionDetailCard;
