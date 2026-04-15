import { cn } from '@helpers/utils';
import type { FC } from 'react';
import type { TabBarProps } from './types';

const TabBar: FC<TabBarProps> = ({ tabs, active, onChange }) => (
  <div className='relative w-full -mx-6 px-6 sm:mx-0 sm:px-0'>
    <div className='flex items-center gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-default'>
      {tabs.map(({ id, label, count }) => (
        <button
          key={id}
          type='button'
          onClick={() => onChange(id)}
          className={cn(
            'shrink-0 snap-start px-4 py-1.5 rounded-full text-[12px] border transition-colors',
            active === id
              ? 'bg-accent text-white border-accent'
              : 'text-gray-light-800 dark:text-gray-dark-200 border-gray-light-400 dark:border-gray-dark-400 hover:border-accent/50'
          )}
        >
          {label}
          {count !== undefined ? ` (${count})` : ''}
        </button>
      ))}
    </div>
  </div>
);

export default TabBar;
