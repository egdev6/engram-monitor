import { cn } from '@helpers/utils';
import { ArrowLeft } from 'lucide-react';
import type { FC } from 'react';
import type { BackButtonProps } from './types';

const BackButton: FC<BackButtonProps> = ({ label = 'Back', className, ...props }) => (
  <button
    type='button'
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-mono transition-colors',
      'border border-gray-light-400 dark:border-gray-dark-600',
      'text-gray-light-700 dark:text-gray-dark-300',
      'hover:border-accent/50 hover:text-accent',
      className
    )}
    {...props}
  >
    <ArrowLeft size={14} strokeWidth={1.5} />
    {label}
  </button>
);

export default BackButton;
