import { cn } from '@helpers/utils';
import { type TextProps, textVariants } from './types';

const Text = ({ tag = 'p', size, color, prominent, className, children, ...rest }: TextProps) => {
  const Component = tag;
  const value = size ?? tag;

  return (
    <Component className={cn(textVariants({ size: value, color, prominent }), className)} {...rest}>
      {children}
    </Component>
  );
};

export default Text;
