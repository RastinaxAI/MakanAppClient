import { uiClass } from '@/components/v5/classes';
import type { ReactNode } from 'react';
import t from './messaging-theme.module.css';

/** The PDF palette belongs to messaging; the rest of the client keeps its own theme. */
export function MessagingSurface({
  children,
  className = '',
  full = false,
}: {
  children: ReactNode;
  className?: string;
  full?: boolean;
}) {
  return (
    <div
      className={uiClass(`${t.theme} ${full ? '' : t.page} ${className}`)}
      data-messaging-surface
    >
      {children}
    </div>
  );
}
