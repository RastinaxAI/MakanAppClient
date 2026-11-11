import type { ComponentProps } from 'react';
import { uiClass } from '@/components/v5/classes';

export function Card({
  variant = 'default',
  className,
  ...props
}: ComponentProps<'section'> & { variant?: 'default' | 'hero' | 'flat' }) {
  return (
    <section {...props} className={uiClass('card', variant !== 'default' && variant, className)} />
  );
}
