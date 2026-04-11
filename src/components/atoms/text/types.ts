import type { ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

export const textVariants = tv({
  base: 'font-secondary font-normal leading-[1.2]',
  variants: {
    size: {
      h1: 'fs-h1',
      h2: 'fs-h2',
      h3: 'fs-h3',
      h4: 'fs-h4',
      h5: 'fs-h5',
      h6: 'fs-h6',
      p: 'fs-base',
      span: 'fs-base',
      small: 'fs-small'
    },
    color: {
      default: 'text-[var(--color-text)] dark:text-[var(--color-dark-text)]',
      primary: 'text-primary',
      secondary: 'text-secondary',
      accent: 'text-accent'
    },
    prominent: {
      true: 'font-bold',
      false: ''
    }
  },
  defaultVariants: {
    size: undefined,
    color: 'default',
    prominent: false
  }
});

export type TextVariant = keyof typeof textVariants.variants.size;

export type TextProps = {
  children: ReactNode;
  tag?: TextVariant;
  className?: string;
} & VariantProps<typeof textVariants>;
