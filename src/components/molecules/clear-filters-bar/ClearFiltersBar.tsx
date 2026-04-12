import type { FC } from 'react';
import type { ClearFiltersBarProps } from './types';

const ClearFiltersBar: FC<ClearFiltersBarProps> = ({ shown, total, label, onClear }) => (
  <div className='flex items-center gap-2'>
    <span className='text-[11px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
      {shown} of {total} {label}
    </span>
    <button type='button' onClick={onClear} className='text-[11px] font-mono text-accent hover:underline'>
      Clear filters
    </button>
  </div>
);

export default ClearFiltersBar;
