import { cn } from '@helpers/utils';
import type { FC } from 'react';
import type { IconButtonProps } from './types';

const IconButton: FC<IconButtonProps> = ({ icon: Icon, size = 16, label, className, ...props }) => (
  <button
    type='button'
    aria-label={label}
    className={cn(
      'shrink-0 transition-colors',
      'text-gray-light-600 dark:text-gray-dark-300',
      'hover:text-text-light dark:hover:text-text-dark',
      className
    )}
    {...props}
  >
    <Icon size={size} />
  </button>
);

export default IconButton;
