'use client';
import { uiClass } from '@/components/v5/classes';

import { buttonClass } from '@/components/ui/button';

import * as uiText from '@/content/fa';
import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  type ReactNode,
  type Ref,
  type FormEventHandler,
} from 'react';
import Link from 'next/link';
import { currentLayouts, currentDeepViews } from '@/design/v5-layouts';
import { useScrollMemory } from '@/components/navigation/scroll-memory';
import { ContextBackLink } from '@/components/navigation/page-back';
import { ChevronRight, MoreHorizontal, PanelRight } from 'lucide-react';
import { BrandMark } from '@/components/ui/brand';
import frameStyles from './frame.module.css';
import sceneStyles from './scene.module.css';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  SceneFormAction,
  SceneContextSummary,
  SceneMenuTools,
  SceneMenuClose,
  SceneHeader,
  SceneFooter,
  type SceneHeading,
  type SceneSummary,
} from './form-actions';
export const ProductContext = createContext<{ title: string; role: string; memoryKey?: string }>({
  title: '',
  role: '',
});
export function V5Scene({
  id,
  title,
  subtitle,
  back,
  onBack,
  backWithinPage = false,
  overlayActive = false,
  onMore,
  moreLabel,
  actions,
  menu,
  children,
  kind,
  context,
  contextTitle,
  deep = currentDeepViews.has(id),
  onSubmit,
  layout = 'standard',
  schoolForm = false,
  summary,
  headingRef,
  moreButtonRef,
  restricted = false,
  headerTools,
  headerClassName,
  header,
  contextual = false,
  footerSlot = false,
  desktopActionPlacement = 'footer',
}: {
  id: string;
  title: string;
  subtitle?: string;
  back: string;
  onBack?: () => void;
  backWithinPage?: boolean;
  overlayActive?: boolean;
  onMore?: () => void;
  moreLabel?: string;
  actions?: ReactNode;
  menu?: ReactNode;
  children: ReactNode;
  kind?: 'form' | 'list' | 'article' | 'dashboard' | 'status' | 'chat';
  context?: ReactNode;
  contextTitle?: string;
  deep?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  layout?: 'standard' | 'table' | 'editor' | 'messenger';
  schoolForm?: boolean;
  summary?: SceneSummary;
  headingRef?: Ref<HTMLHeadingElement>;
  moreButtonRef?: Ref<HTMLButtonElement>;
  restricted?: boolean;
  headerTools?: ReactNode;
  headerClassName?: string;
  /** A workspace may own a specialized header without changing other page shells. */
  header?: ReactNode;
  contextual?: boolean;
  footerSlot?: boolean;
  desktopActionPlacement?: 'header' | 'footer';
}) {
  const sceneKind = overlayActive ? 'modal' : kind || currentLayouts[id] || 'form';
  const [formAction, setFormAction] = useState<ReactNode>();
  const [contextOpen, setContextOpen] = useState(false);
  const [publishedSummary, setPublishedSummary] = useState<SceneSummary>();
  const [menuTools, setMenuTools] = useState<ReactNode>();
  const [workspaceHeading, setWorkspaceHeading] = useState<SceneHeading>();
  const [workspaceFooter, setWorkspaceFooter] = useState<HTMLElement | null>(null);
  const heading = workspaceHeading?.title ?? title;
  const headingSubtitle = workspaceHeading?.subtitle ?? subtitle;
  const tools = workspaceHeading?.tools ?? headerTools;
  const closeMenu = useCallback(() => setOpen(false), []);
  const sceneActions = formAction ?? actions;
  const place = useContext(ProductContext),
    [open, setOpen] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const compactScroll = useRef<HTMLDivElement>(null);
  useScrollMemory(scroll, id + ':' + (place.memoryKey ?? 'account'));
  useScrollMemory(compactScroll, id + '-compact:' + (place.memoryKey ?? 'account'));
  // Context is a page-owned slot, never an inferred copy of arbitrary descendants.
  const contextRows = (summary ?? publishedSummary ?? []).filter((item) => item.value).slice(0, 4);
  const showContext =
    !restricted &&
    layout !== 'editor' &&
    layout !== 'messenger' &&
    (context !== undefined || contextual);
  const side = context ?? (
    <>
      <div className={uiClass('context-tag')}>
        <PanelRight size={18} />
        {uiText.v5Product.context}
      </div>
      <h3>{contextTitle || place.title || title}</h3>
      <p>{subtitle || place.role}</p>
      {contextRows.length
        ? contextRows.map((item, index) => (
            <div className={uiClass('context-item')} key={index}>
              <b>{item.label}</b>
              <div className={uiClass('context-value')}>
                <bdi>{item.value}</bdi>
              </div>
            </div>
          ))
        : null}
    </>
  );
  const navigationMenu =
    menu ??
    (!onMore ? (
      <div className={uiClass('stack')}>
        <Link className={uiClass(buttonClass('button button-outline'))} href="/personal/profile">
          {uiText.navigation_profile}
        </Link>
        <Link
          className={uiClass(buttonClass('button button-outline'))}
          href="/personal/settings/help"
        >
          {uiText.v4Text.support}
        </Link>
      </div>
    ) : undefined);
  const pageMenu = menuTools ? (
    <div className={uiClass('stack')}>
      {menuTools}
      {navigationMenu}
    </div>
  ) : (
    navigationMenu
  );
  const content = (
    <>
      <div className={uiClass('rx-page-scroll-region')} ref={compactScroll}>
        {header ?? (
          <header className={uiClass('rx-head', headerClassName)} role="banner">
            {!deep && back === '/personal' && !backWithinPage ? (
              onBack ? (
                <button
                  type="button"
                  className={uiClass('rx-icon-button', sceneStyles.brandMark)}
                  onClick={onBack}
                  aria-label={uiText.text_e357d20c5ae7}
                >
                  <BrandMark />
                </button>
              ) : (
                <span className={sceneStyles.brandMark} aria-hidden="true">
                  <BrandMark />
                </span>
              )
            ) : onBack ? (
              <button
                type="button"
                className={uiClass('rx-icon-button rx-back')}
                aria-label={uiText.common_back}
                data-navigation-target={backWithinPage ? undefined : back}
                onClick={onBack}
              >
                <ChevronRight />
              </button>
            ) : (
              <ContextBackLink
                className={uiClass('rx-icon-button rx-back')}
                href={back}
                aria-label={uiText.common_back}
              >
                <ChevronRight />
              </ContextBackLink>
            )}
            <div className={uiClass('grow')}>
              <div className={uiClass('rx-crumb')}>
                {contextTitle || (place.role ? place.title : uiText.brand_name) || title}
              </div>
              {workspaceHeading?.href ? (
                <Link
                  className={sceneStyles.headingLink}
                  href={workspaceHeading.href}
                  aria-label={uiText.text_3a3510c0ba99}
                >
                  <h1 ref={headingRef} tabIndex={-1}>
                    {heading}
                  </h1>
                  {(headingSubtitle || place.role) && <p>{headingSubtitle || place.role}</p>}
                </Link>
              ) : (
                <>
                  <h1 ref={headingRef} tabIndex={-1}>
                    {heading}
                  </h1>
                  {(headingSubtitle || place.role) && <p>{headingSubtitle || place.role}</p>}
                </>
              )}
            </div>
            {sceneActions && <div className={uiClass('head-action')}>{sceneActions}</div>}
            {showContext && (
              <button
                type="button"
                className={uiClass('rx-icon-button', sceneStyles.contextToggle)}
                aria-label={uiText.v5Product.context}
                onClick={() => setContextOpen(true)}
              >
                <PanelRight />
              </button>
            )}
            {tools}
            {!tools && (pageMenu || onMore) && (
              <button
                ref={moreButtonRef}
                type="button"
                className={uiClass('rx-icon-button')}
                aria-label={menuTools ? uiText.v4_more : moreLabel || uiText.v4_more}
                onClick={() => (pageMenu ? setOpen(true) : onMore?.())}
              >
                <MoreHorizontal />
              </button>
            )}
          </header>
        )}
        <div className={uiClass('rx-content')} ref={scroll}>
          <div className={uiClass('rx-workspace')} data-with-context={showContext || undefined}>
            <div className={uiClass('rx-body-grid')}>{children}</div>
            {showContext && (
              <aside className={uiClass('rx-context-panel')} aria-label={uiText.v5Product.context}>
                {side}
              </aside>
            )}
          </div>
        </div>
      </div>
      {sceneActions && <footer className={uiClass('rx-bottom-actions')}>{sceneActions}</footer>}
      {footerSlot && <footer ref={setWorkspaceFooter} className={uiClass('rx-workspace-footer')} />}
    </>
  );
  return (
    <SceneFormAction.Provider value={setFormAction}>
      <SceneContextSummary.Provider value={setPublishedSummary}>
        <SceneMenuTools.Provider value={setMenuTools}>
          <SceneMenuClose.Provider value={closeMenu}>
            <SceneHeader.Provider value={setWorkspaceHeading}>
              <SceneFooter.Provider value={workspaceFooter}>
                {onSubmit ? (
                  <form
                    className={uiClass(
                      frameStyles.frame +
                        ' ' +
                        sceneStyles.scene +
                        ' v5-scene kind-' +
                        sceneKind +
                        ' layout-' +
                        layout,
                    )}
                    data-v5-scene={id}
                    data-desktop-action-placement={desktopActionPlacement}
                    data-overlay-active={overlayActive || undefined}
                    data-back-within-page={backWithinPage || undefined}
                    data-school-form={schoolForm || undefined}
                    data-v5-deep={deep || undefined}
                    data-v5-restricted={restricted || undefined}
                    onSubmit={onSubmit}
                  >
                    {content}
                  </form>
                ) : (
                  <section
                    className={uiClass(
                      frameStyles.frame +
                        ' ' +
                        sceneStyles.scene +
                        ' v5-scene kind-' +
                        sceneKind +
                        ' layout-' +
                        layout,
                    )}
                    data-v5-scene={id}
                    data-desktop-action-placement={desktopActionPlacement}
                    data-overlay-active={overlayActive || undefined}
                    data-back-within-page={backWithinPage || undefined}
                    data-v5-deep={deep || undefined}
                    data-v5-restricted={restricted || undefined}
                  >
                    {content}
                  </section>
                )}
                {pageMenu && (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent title={uiText.v4_more}>{pageMenu}</DialogContent>
                  </Dialog>
                )}
                {showContext && (
                  <Dialog open={contextOpen} onOpenChange={setContextOpen}>
                    <DialogContent title={contextTitle || uiText.v5Product.context}>
                      {side}
                    </DialogContent>
                  </Dialog>
                )}
              </SceneFooter.Provider>
            </SceneHeader.Provider>
          </SceneMenuClose.Provider>
        </SceneMenuTools.Provider>
      </SceneContextSummary.Provider>
    </SceneFormAction.Provider>
  );
}
