import { INPUT_CLS } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import { Search, X } from 'lucide-react';
import type { FC } from 'react';
import type { SearchInputProps } from './types';

const SearchInput: FC<SearchInputProps> = ({ value, onChange, placeholder, className }) => (
  <div className='relative'>
    <Search
      size={13}
      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-light-500 dark:text-gray-dark-300 pointer-events-none'
    />
    <input
      type='text'
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(INPUT_CLS, 'w-full pl-8', className)}
    />
    {value && (
      <button
        type='button'
        onClick={() => onChange('')}
        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-light-500 dark:text-gray-dark-300 hover:text-accent'
      >
        <X size={12} />
      </button>
    )}
  </div>
);

export default SearchInput;
