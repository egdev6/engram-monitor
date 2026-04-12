import { INPUT_CLS } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import type { FC } from 'react';
import type { FilterSelectProps } from './types';

const FilterSelect: FC<FilterSelectProps> = ({ label, value, onChange, options, className }) => (
  <div className='flex items-center gap-1.5'>
    <span className='text-[10px] font-mono uppercase tracking-widest text-gray-light-600 dark:text-gray-dark-300 shrink-0'>
      {label}
    </span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(INPUT_CLS, 'py-1.5', className)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default FilterSelect;
