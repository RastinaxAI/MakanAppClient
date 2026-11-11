'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { cloneElement, isValidElement, useId, type ReactNode, type ReactElement } from 'react';
import { Check, ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

/** Compatibility exports for connected flows; all rendering is V5. */
export { V5Scene as V4Page } from '@/components/v5/scene';
export function V4Hero({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card variant="hero" className={uiClass('v5-hero')}>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </Card>
  );
}
export function V4List({ children }: { children: ReactNode }) {
  return <div className={uiClass('v5-list list')}>{children}</div>;
}
export function V4Row({
  title,
  description,
  icon,
  iconClassName = 'tile-icon',
  end,
  endInteractive = true,
  href,
  onClick,
  ariaLabel,
  testId,
  disabled = false,
  pressed,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  iconClassName?: string;
  end?: ReactNode;
  /** A decorative status may remain inside the single row button. */
  endInteractive?: boolean;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  testId?: string;
  disabled?: boolean;
  pressed?: boolean;
}) {
  const content = (
    <>
      {icon && (
        <span className={uiClass(iconClassName)} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={uiClass('v5-row-copy grow')}>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      {end ??
        ((href || onClick) && (
          <span className={uiClass('chev')}>
            <ChevronLeft size={18} />
          </span>
        ))}
    </>
  );
  if (onClick && end && endInteractive)
    return (
      <div className={uiClass('v5-row row')} data-testid={testId}>
        <button
          className={uiClass('v5-row-main')}
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          disabled={disabled}
          aria-pressed={pressed}
        >
          {icon && (
            <span className={uiClass(iconClassName)} aria-hidden="true">
              {icon}
            </span>
          )}
          <span className={uiClass('v5-row-copy grow')}>
            <strong>{title}</strong>
            {description && <small>{description}</small>}
          </span>
        </button>
        {end}
      </div>
    );
  return href ? (
    <Link className={uiClass('v5-row row')} href={href} aria-label={ariaLabel} data-testid={testId}>
      {content}
    </Link>
  ) : onClick ? (
    <button
      className={uiClass('v5-row row')}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid={testId}
      disabled={disabled}
      aria-pressed={pressed}
    >
      {content}
    </button>
  ) : (
    <div className={uiClass('v5-row row')} data-testid={testId}>
      {content}
    </div>
  );
}
/** A native, keyboard-operable switch with the same row geometry as V5 settings. */
export function V4SwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <V4Row
      title={title}
      description={description && <span id={id + '-hint'}>{description}</span>}
      end={
        <label className={uiClass('v5-switch')} htmlFor={id}>
          <NativeInput
            id={id}
            type="checkbox"
            role="switch"
            aria-label={title}
            aria-describedby={description ? id + '-hint' : undefined}
            checked={checked}
            disabled={disabled}
            onChange={(event) => onCheckedChange(event.target.checked)}
          />
        </label>
      }
    />
  );
}
export function V4Note({ children }: { children: ReactNode }) {
  return (
    <div className={uiClass('v5-note alert')}>
      <Info size={18} />
      <p>{children}</p>
    </div>
  );
}
export function V4CheckLine({
  label,
  checked,
  onCheckedChange,
  disabled,
  required,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className={uiClass('checkline v5-native-checkline')}>
      <NativeInput
        type="checkbox"
        className={uiClass('v5-checkline-control')}
        required={required}
        disabled={disabled}
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span className={uiClass(`checkbox${checked ? ' checked' : ''}`)} aria-hidden="true">
        {checked && <Check size={15} />}
      </span>
      <span>{label}</span>
    </label>
  );
}
export function V4Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Optional readable value for a custom control in the page's context panel. */
  summaryValue?: string;
}) {
  const generated = useId();
  const child = isValidElement(children)
    ? (children as ReactElement<{
        id?: string;
        'aria-describedby'?: string;
        'aria-label'?: string;
        'aria-invalid'?: boolean;
        'aria-required'?: boolean | 'true' | 'false';
        required?: boolean;
      }>)
    : null;
  const id = child?.props.id ?? generated;
  return (
    <div className={uiClass('v5-field field')}>
      <label htmlFor={id}>
        {label}
        {(child?.props.required ||
          child?.props['aria-required'] === true ||
          child?.props['aria-required'] === 'true') && <span aria-hidden="true"> *</span>}
      </label>
      {child
        ? cloneElement(child, {
            id,
            ...(child.props.required ||
            child.props['aria-required'] === true ||
            child.props['aria-required'] === 'true'
              ? { 'aria-label': child.props['aria-label'] ?? label }
              : {}),
            'aria-describedby':
              [child.props['aria-describedby'], hint && id + '-hint', error && id + '-error']
                .filter(Boolean)
                .join(' ') || undefined,
            ...(error ? { 'aria-invalid': true } : {}),
          })
        : children}
      {hint && <small id={id + '-hint'}>{hint}</small>}
      {error && (
        <small id={id + '-error'} className={uiClass('field-error')} role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
