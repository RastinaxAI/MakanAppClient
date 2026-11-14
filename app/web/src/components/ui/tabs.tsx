'use client';
import type { ComponentProps, ReactNode } from 'react';
import { uiClass } from '@/components/v5/classes';

/** Route links keep normal navigation; aria-current is owned by each real route. */
export function SegmentedNavigation({ className, ...props }: ComponentProps<'nav'>) {
  return <nav {...props} className={uiClass('v5-segmented', className)} />;
}
/** Local panels keep their workspace and use the RTL keyboard order. */
export function ViewTabs<T extends string>({
  value,
  onChange,
  items,
  label,
  prefix,
  className,
  disabled = false,
}: {
  value: T;
  onChange: (value: T) => void;
  items: readonly { value: T; label: string; icon?: ReactNode }[];
  label: string;
  prefix: string;
  className: string;
  disabled?: boolean;
}) {
  return (
    <div role="tablist" aria-label={label} className={className}>
      {items.map((item, index) => (
        <button
          key={item.value}
          type="button"
          disabled={disabled}
          role="tab"
          id={`${prefix}-tab-${item.value}`}
          aria-controls={`${prefix}-panel-${item.value}`}
          aria-selected={value === item.value}
          tabIndex={value === item.value ? 0 : -1}
          onFocus={(event) =>
            event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
          }
          onClick={() => onChange(item.value)}
          onKeyDown={(event) => {
            const next =
              event.key === 'ArrowLeft'
                ? (index + 1) % items.length
                : event.key === 'ArrowRight'
                  ? (index + items.length - 1) % items.length
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? items.length - 1
                      : -1;
            if (next < 0) return;
            event.preventDefault();
            event.currentTarget.parentElement
              ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
              [next]?.focus();
            onChange(items[next].value);
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
