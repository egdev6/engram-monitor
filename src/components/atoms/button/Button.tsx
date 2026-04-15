import { cn } from '@helpers/utils';
import type { FC } from 'react';
import type { ButtonProps } from './types';

const Button: FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon: Icon,
  iconSize,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    default: [
      'bg-gray-light-100 dark:bg-gray-dark-800',
      'border border-gray-light-400 dark:border-gray-dark-600',
      'text-text-light dark:text-text-dark',
      'hover:border-accent/60 hover:bg-accent/10'
    ].join(' '),
    primary: ['bg-accent/20 text-accent', 'border border-accent/30', 'hover:bg-accent/30'].join(' '),
    ghost: [
      'border border-gray-light-400 dark:border-gray-dark-600',
      'text-text-light dark:text-text-dark',
      'hover:bg-gray-light-200 dark:hover:bg-gray-dark-800'
    ].join(' ')
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[11px]',
    md: 'px-4 py-2.5 text-[12px]'
  };

  const defaultIconSize = size === 'sm' ? 12 : 14;

  return (
    <button
      type='button'
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        Icon && 'flex items-center gap-1.5',
        className
      )}
      {...props}
    >
      {Icon && <Icon size={iconSize || defaultIconSize} />}
      {children}
    </button>
  );
};

export default Button;
