import { INPUT_CLS } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import type { FC } from 'react';
import type { DateInputProps } from './types';

const DateInput: FC<DateInputProps> = ({ label, value, onChange, min, max }) => (
  <div className='flex items-center gap-1.5'>
    <span className='text-[10px] uppercase tracking-widest text-gray-light-600 dark:text-gray-dark-300 shrink-0'>
      {label}
    </span>
    <input
      type='date'
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className={cn(INPUT_CLS, 'py-1.5')}
    />
  </div>
);

export default DateInput;
