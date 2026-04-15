import { cn } from '@helpers/utils';
import type { FC } from 'react';
import type { StatCardProps } from './types';

const StatCard: FC<StatCardProps> = ({ label, value, loading, accent }) => (
  <div
    className={cn(
      'rounded-lg border px-4 py-3 flex flex-col gap-0.5',
      'bg-gray-light-100 dark:bg-gray-dark-800 border-gray-light-400 dark:border-gray-dark-600',
      accent && 'border-accent/40'
    )}
  >
    <span className='text-[10px] uppercase tracking-widest text-gray-light-700 dark:text-gray-dark-300'>{label}</span>
    {loading ? (
      <div className='h-6 w-12 rounded bg-gray-light-300 dark:bg-gray-dark-600 animate-pulse mt-0.5' />
    ) : (
      <span className={cn('text-xl font-bold', accent ? 'text-accent' : 'text-text-light dark:text-text-dark')}>
        {value}
      </span>
    )}
  </div>
);

export default StatCard;
