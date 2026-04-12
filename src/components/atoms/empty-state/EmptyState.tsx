import type { FC } from 'react';
import type { EmptyStateProps } from './types';

const EmptyState: FC<EmptyStateProps> = ({ message }) => (
  <p className='text-center py-10 text-[13px] font-mono text-gray-light-600 dark:text-gray-dark-300'>
    {message}
  </p>
);

export default EmptyState;
