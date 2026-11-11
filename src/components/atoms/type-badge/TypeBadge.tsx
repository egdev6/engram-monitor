import { FALLBACK_TYPE_COLOR, TYPE_COLORS } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import type { FC } from 'react';
import type { TypeBadgeProps } from './types';

const TypeBadge: FC<TypeBadgeProps> = ({ type }) => {
  const cls = TYPE_COLORS[type] ?? FALLBACK_TYPE_COLOR;
  return (
    <span
      className={cn('inline-flex px-1.5 py-px rounded-full text-[9px] uppercase tracking-wide border shrink-0', cls)}
    >
      {type}
    </span>
  );
};

export default TypeBadge;
