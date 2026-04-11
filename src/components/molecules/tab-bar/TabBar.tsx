import { cn } from '@helpers/utils';
import type { FC } from 'react';
import type { TabBarProps } from './types';

const TabBar: FC<TabBarProps> = ({ tabs, active, onChange }) => (
  <div className='flex items-center gap-2'>
    {tabs.map(({ id, label, count }) => (
      <button
        key={id}
        type='button'
        onClick={() => onChange(id)}
        className={cn(
          'px-4 py-1.5 rounded-full text-[12px] font-mono border transition-colors',
          active === id
            ? 'bg-accent text-white border-accent'
            : 'text-gray-light-800 dark:text-gray-dark-200 border-gray-light-400 dark:border-gray-dark-400 hover:border-accent/50',
        )}
      >
        {label}{count !== undefined ? ` (${count})` : ''}
      </button>
    ))}
  </div>
);

export default TabBar;
