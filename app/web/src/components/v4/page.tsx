'use client';
import { cloneElement, isValidElement, useId, type ReactNode, type ReactElement } from 'react';
import { ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';

/** Compatibility exports for connected flows; all rendering is V5. */
export { V5Scene as V4Page } from '@/components/v5/scene';
export function V4Hero({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="v5-hero card hero">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </section>
  );
}
export function V4List({ children }: { children: ReactNode }) {
  return <div className="v5-list list">{children}</div>;
}
export function V4Row({
  title,
  description,
  icon,
  end,
  href,
  onClick,
  ariaLabel,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  end?: ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const content = (
    <>
      {icon && <span className="tile-icon">{icon}</span>}
      <span className="v5-row-copy grow">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      {end ??
        ((href || onClick) && (
          <span className="chev">
            <ChevronLeft size={18} />
          </span>
        ))}
    </>
  );
  if (onClick && end)
    return (
      <div className="v5-row row">
        <button className="v5-row-main" type="button" onClick={onClick}>
          {icon && <span className="tile-icon">{icon}</span>}
          <span className="v5-row-copy grow">
            <strong>{title}</strong>
            {description && <small>{description}</small>}
          </span>
        </button>
        {end}
      </div>
    );
  return href ? (
    <Link className="v5-row row" href={href} aria-label={ariaLabel}>
      {content}
    </Link>
  ) : onClick ? (
    <button className="v5-row row" type="button" onClick={onClick} aria-label={ariaLabel}>
      {content}
    </button>
  ) : (
    <div className="v5-row row">{content}</div>
  );
}
export function V4Note({ children }: { children: ReactNode }) {
  return (
    <div className="v5-note alert">
      <Info size={18} />
      <p>{children}</p>
    </div>
  );
}
export function V4Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const generated = useId();
  const child = isValidElement(children)
    ? (children as ReactElement<{ id?: string; 'aria-describedby'?: string }>)
    : null;
  const id = child?.props.id ?? generated;
  return (
    <div className="v5-field field">
      <label htmlFor={id}>{label}</label>
      {child
        ? cloneElement(child, {
            id,
            'aria-describedby': hint ? id + '-hint' : child.props['aria-describedby'],
          })
        : children}
      {hint && <small id={id + '-hint'}>{hint}</small>}
    </div>
  );
}
