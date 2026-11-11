import type { ComponentProps } from 'react';
import { uiClass } from '@/components/v5/classes';

/** Route links keep normal navigation; aria-current is owned by each real route. */
export function SegmentedNavigation({ className, ...props }: ComponentProps<'nav'>) {
  return <nav {...props} className={uiClass('v5-segmented', className)} />;
}
