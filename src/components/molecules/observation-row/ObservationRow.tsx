import { cn } from '@helpers/utils';
import { TypeBadge } from '@atoms/type-badge';
import { Calendar, Clock } from 'lucide-react';
import type { FC } from 'react';
import type { ObservationRowProps } from './types';

const ObservationRow: FC<ObservationRowProps> = ({ observation: obs, onClick, showTime = false }) => (
  <button
    key={obs.id}
    type='button'
    onClick={() => onClick(obs)}
    className={cn(
      'w-full flex flex-col items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors',
      'bg-gray-light-100 dark:bg-gray-dark-800',
      'border-gray-light-300 dark:border-gray-dark-700',
      'hover:border-accent/40 hover:bg-gray-light-200 dark:hover:bg-gray-dark-700',
    )}
  >
    <div className='w-full flex gap-2 items-center'>
      <TypeBadge type={obs.type} />
      <div className='flex-1 min-w-0 flex flex-col gap-0.5 max-w-[70%]'>
        <span className='text-[13px] text-text-light dark:text-text-dark truncate'>{obs.title}</span>
      </div>
    </div>
    <div className='w-full flex justify-between gap-0.5 shrink-0'>
      {!showTime && obs.project && (
        <span className='text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300 hidden sm:block'>
          {obs.project}
        </span>
      )}
      <span className='flex items-center gap-1 text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
        {showTime
          ? <><Clock size={10} strokeWidth={1.5} />{new Date(obs.created_at).toLocaleTimeString()}</>
          : <><Calendar size={10} strokeWidth={1.5} />{new Date(obs.created_at).toLocaleDateString()}</>
        }
      </span>
    </div>
  </button>
);

export default ObservationRow;
