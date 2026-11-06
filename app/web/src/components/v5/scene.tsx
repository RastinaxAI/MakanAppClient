'use client';
import * as uiText from '@/content/fa';
import {
  createContext,
  Children,
  isValidElement,
  useContext,
  useState,
  useRef,
  type ReactNode,
  type FormEventHandler,
} from 'react';
import Link from 'next/link';
import { v5Layouts } from '@/design/v5-layouts';
import { useScrollMemory } from '@/components/navigation/scroll-memory';
import { ChevronRight, MoreHorizontal, PanelRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
export const ProductContext = createContext({ title: '', role: '' });
export function V5Scene({
  id,
  title,
  subtitle,
  back,
  onBack,
  onMore,
  moreLabel,
  actions,
  menu,
  children,
  kind = 'form',
  context,
  deep = true,
  onSubmit,
}: {
  id: string;
  title: string;
  subtitle?: string;
  back: string;
  onBack?: () => void;
  onMore?: () => void;
  moreLabel?: string;
  actions?: ReactNode;
  menu?: ReactNode;
  children: ReactNode;
  kind?: 'form' | 'list' | 'article' | 'dashboard' | 'status';
  context?: ReactNode;
  deep?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}) {
  const sceneKind = v5Layouts[id] || kind;
  const place = useContext(ProductContext),
    [open, setOpen] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  useScrollMemory(scroll, id);
  const summaries: { label: string; value: string }[] = [];
  function collect(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (
        !isValidElement<{
          label?: string;
          title?: string;
          description?: ReactNode;
          children?: ReactNode;
          value?: unknown;
        }>(child)
      )
        return;
      if (child.props.label) {
        const control = Children.toArray(child.props.children).find(
          (c) => isValidElement<{ value?: unknown }>(c) && typeof c.props.value === 'string',
        );
        if (isValidElement<{ value: string }>(control) && control.props.value)
          summaries.push({ label: child.props.label, value: control.props.value });
      }
      if (child.props.title && typeof child.props.description === 'string')
        summaries.push({ label: child.props.title, value: child.props.description });
      collect(child.props.children);
    });
  }
  collect(children);
  const side = context ?? (
    <>
      <div className="context-tag">
        <PanelRight size={18} />
        {uiText.v5Product.context}
      </div>
      <h3>{place.title || title}</h3>
      <p>{subtitle || place.role}</p>
      {summaries.slice(0, 4).map((item, index) => (
        <div className="context-item" key={index}>
          <b>{item.label}</b>
          <div className="context-value">
            <bdi>{item.value}</bdi>
          </div>
        </div>
      ))}
      <div className="context-item">
        <p>{uiText.v5Product.contextBackPolicy}</p>
      </div>
    </>
  );
  const pageMenu =
    menu ??
    (!onMore ? (
      <div className="stack">
        <Link className="button button-outline" href="/personal/profile">
          {uiText.navigation_profile}
        </Link>
        <Link className="button button-outline" href="/personal/settings/help">
          {uiText.v4Text.support}
        </Link>
      </div>
    ) : undefined);
  const content = (
    <>
      <header className="rx-head" role="banner">
        {onBack ? (
          <button
            type="button"
            className="rx-icon-button rx-back"
            aria-label={uiText.common_back}
            data-navigation-target={back}
            onClick={onBack}
          >
            <ChevronRight />
          </button>
        ) : (
          <Link className="rx-icon-button rx-back" href={back} aria-label={uiText.common_back}>
            <ChevronRight />
          </Link>
        )}
        <div className="grow">
          <div className="rx-crumb">
            <span className="v5-crumb-static">{place.title || title}</span>
            {onBack ? (
              <button type="button" aria-label={uiText.common_back} onClick={onBack}>
                {place.title || title}
              </button>
            ) : (
              <Link href={back} aria-label={uiText.common_back}>
                {place.title || title}
              </Link>
            )}
          </div>
          <h1>{title}</h1>
          {(subtitle || place.role) && <p>{subtitle || place.role}</p>}
        </div>
        {actions && <div className="head-action">{actions}</div>}
        {(pageMenu || onMore) && (
          <button
            type="button"
            className="rx-icon-button"
            aria-label={moreLabel || uiText.v4_more}
            onClick={() => (pageMenu ? setOpen(true) : onMore?.())}
          >
            <MoreHorizontal />
          </button>
        )}
      </header>
      <div className="rx-content" ref={scroll}>
        <div className="rx-workspace">
          <div className="rx-body-grid">{children}</div>
          <aside className="rx-context-panel">{side}</aside>
        </div>
      </div>
      {actions && <footer className="rx-bottom-actions">{actions}</footer>}
    </>
  );
  return (
    <>
      {onSubmit ? (
        <form
          className={'v5-scene kind-' + sceneKind}
          data-v5-scene={id}
          data-v5-deep={deep || undefined}
          onSubmit={onSubmit}
        >
          {content}
        </form>
      ) : (
        <section
          className={'v5-scene kind-' + sceneKind}
          data-v5-scene={id}
          data-v5-deep={deep || undefined}
        >
          {content}
        </section>
      )}
      {pageMenu && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent title={uiText.v4_more}>{pageMenu}</DialogContent>
        </Dialog>
      )}
    </>
  );
}
