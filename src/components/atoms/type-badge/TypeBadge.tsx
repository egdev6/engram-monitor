import { TYPE_COLORS } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import type { FC } from 'react';
import type { TypeBadgeProps } from './types';

const TypeBadge: FC<TypeBadgeProps> = ({ type }) => {
  const cls = TYPE_COLORS[type] ?? 'bg-gray-dark-400/30 text-gray-dark-200 border-gray-dark-500/30';
  return (
    <span
      className={cn(
        'inline-flex px-1.5 py-px rounded-full text-[9px] font-mono uppercase tracking-wide border shrink-0',
        cls
      )}
    >
      {type}
    </span>
  );
};

export default TypeBadge;
