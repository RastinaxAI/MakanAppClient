'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { BrandMark } from '@/components/ui/brand';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogStyleContext } from '@/components/ui/dialog';
import { LoadingSkeleton, label } from '@/components/ui/states';
import { isFocusedPage, isMessageRoom } from '@/config/navigation';
import type { components } from '@/generated/api/schema';
import {
  ChevronDown,
  CircleUserRound,
  Bell,
  Search,
  ChevronRight,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useScrollMemory } from '@/components/navigation/scroll-memory';
import s from './shell.module.css';
import frameStyles from '@/components/v5/frame.module.css';
import { usePersonal, usePersonalApi } from './provider';
import { useWorkspaceSnapshot, SchoolContextPicker } from './workspaces';
import { useThemePreference } from './theme';
import {
  PageBackProvider,
  usePageBackTarget,
  ContextBackLink,
} from '@/components/navigation/page-back';
import { AppNavigation } from '@/components/navigation/app-navigation';
import { ProductContext } from '@/components/v5/scene';
import { PageHeadingProvider, usePageHeading } from '@/components/navigation/page-heading';
import messengerTheme from './messaging/messaging-theme.module.css';
export function PersonalShell({ children }: { children: ReactNode }) {
  const { session } = usePersonal();
  const pathname = usePathname();
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const visual = window.visualViewport;
    if (!visual) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const occluded = visual.scale === 1 && visual.height < innerHeight - 80;
        if (occluded) {
          viewport.current?.style.setProperty('--app-viewport-height', `${visual.height}px`);
          document.documentElement.style.setProperty('--app-visual-height', `${visual.height}px`);
        } else {
          viewport.current?.style.removeProperty('--app-viewport-height');
          document.documentElement.style.removeProperty('--app-visual-height');
        }
      });
    };
    visual.addEventListener('resize', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      cancelAnimationFrame(frame);
      visual.removeEventListener('resize', update);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
      document.documentElement.style.removeProperty('--app-visual-height');
    };
  }, []);
  return (
    <PageBackProvider
      key={session.user.id + ':' + session.context.sessionId}
      namespace={session.user.id + ':' + session.context.sessionId}
    >
      <PageHeadingProvider>
        <div ref={viewport} className={uiClass('v5-product-viewport ' + frameStyles.viewport)}>
          <DialogStyleContext.Provider
            value={
              pathname.startsWith('/personal/messages')
                ? {
                    content: `${messengerTheme.theme} ${messengerTheme.dialog}`,
                    overlay: messengerTheme.overlay,
                  }
                : { content: '', overlay: '' }
            }
          >
            <PersonalShellContent>{children}</PersonalShellContent>
          </DialogStyleContext.Provider>
        </div>
      </PageHeadingProvider>
    </PageBackProvider>
  );
}
function PersonalShellContent({ children }: { children: ReactNode }) {
  const heading = usePageHeading();
  const backTarget = usePageBackTarget();
  const { session, changing } = usePersonal();
  const pathname = usePathname();
  const mainScroll = useRef<HTMLElement | null>(null);
  useScrollMemory(mainScroll, 'shell');
  useThemePreference();
  const messageLayout = pathname === '/personal/messages' || isMessageRoom(pathname);
  const messagingPage =
    pathname.startsWith('/personal/messages/') ||
    pathname === '/personal/contacts' ||
    ['/personal/settings/privacy', '/personal/settings/blocked'].includes(pathname);
  const educationLayout = pathname.startsWith('/personal/education') || pathname === '/personal';
  const [picker, setPicker] = useState(false);
  const pickerTrigger = useRef<HTMLElement | null>(null);
  function openPicker() {
    pickerTrigger.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPicker(true);
  }
  useEffect(() => {
    const open = () => openPicker();
    window.addEventListener('makan:workspace-picker', open);
    return () => window.removeEventListener('makan:workspace-picker', open);
  }, []);
  const spaces = useWorkspaceSnapshot();
  const active = spaces.data?.workspaces.find(
    (w) => w.membershipId === session.context.membershipId && w.role === session.context.activeRole,
  );
  const workspaceTitle =
    active?.organizationName ??
    (session.context.workspaceType === 'Organization'
      ? uiText.text_b05e4b9892e2
      : uiText.text_ab3c684df5df);
  const domainRole =
    educationLayout && session.context.activeRole
      ? label(session.context.activeRole)
      : uiText.text_d034f3bcfe7f;
  const guardianChildren = usePersonalApi<components['schemas']['AuthorizedChildResult'][]>(
    '/api/v1/guardian/children',
    {
      enabled:
        session.context.activeRole === 'Parent' && session.context.workspaceType === 'Organization',
    },
  );
  const selectedChild = guardianChildren.data?.find(
    (child) =>
      child.learnerOrganizationPersonId === session.context.subjectOrganizationPersonId &&
      child.organizationId === session.context.organizationId &&
      child.relationStatus === 'Active',
  );
  const home = pathname === '/personal' || pathname === '/personal/education';
  const assistantRoot = pathname === '/personal/assistant' || pathname === '/personal/ai';
  const peerRoot = home || pathname === '/personal/profile' || assistantRoot;
  const HeaderHeading = assistantRoot || heading ? 'h1' : 'h2';
  const conversationSection = pathname.match(
    /^\/personal\/messages\/[^/]+\/(info|edit|settings|members|media|invites|topics)$/,
  )?.[1];
  const conversationTitles: Record<string, string> = {
    info: uiText.text_3a3510c0ba99,
    edit: uiText.text_7f018872aab1,
    settings: uiText.text_ad01ea1c94b6,
    members: uiText.text_6347d5e56150,
    media: uiText.text_8b5bf435319d,
    invites: uiText.text_10c263e49b58,
    topics: uiText.text_0de00f83cacf,
  };
  const pageTitle = conversationSection
    ? conversationTitles[conversationSection]
    : pathname === '/personal/education/invitations'
      ? uiText.text_016c18389868
      : pathname.startsWith('/personal/education/guardians')
        ? uiText.text_d61b3d58a5e7
        : pathname === '/personal/education/reports'
          ? uiText.text_2cbe62e265bd
          : pathname === '/personal/education/overview'
            ? uiText.navigation_education
            : pathname.includes('/education/members')
              ? uiText.text_34e7820beb9d
              : pathname.includes('/education/people')
                ? uiText.text_11a6a5d76e76
                : pathname.includes('/assignments/new')
                  ? uiText.text_6ddab36198ac
                  : pathname.includes('/lessons/new')
                    ? uiText.text_dd307ff5e667
                    : pathname.includes('/lessons/') && pathname.endsWith('/edit')
                      ? uiText.text_9aaef6f3e9c3
                      : pathname === '/personal/profile'
                        ? uiText.text_33f4cefcfd71
                        : pathname === '/personal/profile/preferences'
                          ? uiText.text_8aa6893911d9
                          : pathname.endsWith('/profile/edit')
                            ? uiText.text_7f941e8233a2
                            : pathname.startsWith('/personal/messages')
                              ? uiText.navigation_messages
                              : pathname.startsWith('/personal/contacts')
                                ? uiText.text_b119e3358137
                                : pathname.includes('/assignments')
                                  ? uiText.text_e8fed4d47d62
                                  : pathname.includes('/exams')
                                    ? uiText.text_4f7293cf5780
                                    : pathname.includes('/classes')
                                      ? uiText.text_7c61d113156b
                                      : pathname.includes('/settings')
                                        ? uiText.navigation_settings
                                        : pathname.includes('/assistant')
                                          ? uiText.text_7168b7bf2f42
                                          : uiText.brand_name;
  return (
    <div
      className={uiClass(
        s.shell +
          ' rx-root' +
          (pathname.startsWith('/personal/messages')
            ? ` ${messengerTheme.theme} ${messengerTheme.shell}`
            : ''),
      )}
      data-reference-shell
      data-page-heading-active={!!heading || undefined}
      data-area={
        educationLayout
          ? 'education'
          : pathname.startsWith('/personal/profile')
            ? 'profile'
            : pathname.startsWith('/personal/settings')
              ? 'settings'
              : undefined
      }
      data-focused={isFocusedPage(pathname) || undefined}
      data-messaging={messageLayout || undefined}
      data-messaging-page={messagingPage || undefined}
      data-assistant={
        pathname.startsWith('/personal/assistant') || pathname === '/personal/ai' || undefined
      }
    >
      <a className={uiClass('skip-link')} href="#personal-content">
        {uiText.text_05508133d927}
      </a>
      <aside className={uiClass(s.sidebar)}>
        <Link className={s.brand} href="/personal/profile" aria-label={uiText.brand_name}>
          <BrandMark />
        </Link>
        <AppNavigation presentation="sidebar" />
        <div className={uiClass(s.sidebarBottom)}>
          <Link
            href="/personal/profile"
            className={s.account}
            aria-label={uiText.text_8b4cb595cd35}
          >
            <CircleUserRound size={22} />
            <span>{uiText.text_8b4cb595cd35}</span>
          </Link>
        </div>
      </aside>
      <div className={uiClass(s.workspace)}>
        <header className={uiClass(s.header)}>
          <Dialog open={picker} onOpenChange={setPicker}>
            {peerRoot ? (
              <DialogTrigger asChild>
                <button
                  className={uiClass(s.context)}
                  aria-label={
                    uiText.text_4fdfc489ee16 +
                    workspaceTitle +
                    uiText.text_6eccd825a0c4 +
                    (session.context.activeRole
                      ? label(session.context.activeRole)
                      : uiText.text_1313fa70e766)
                  }
                >
                  <ChevronDown size={20} />
                </button>
              </DialogTrigger>
            ) : (
              <ContextBackLink
                className={uiClass(s.context)}
                href={backTarget}
                aria-label={uiText.common_back}
              >
                <ChevronRight size={20} />
              </ContextBackLink>
            )}
            <DialogContent
              title={uiText.v6Ui.schoolPicker}
              onCloseAutoFocus={(event) => {
                const target = pickerTrigger.current;
                pickerTrigger.current = null;
                if (target?.isConnected) {
                  event.preventDefault();
                  target.focus();
                }
              }}
            >
              <SchoolContextPicker onSelected={() => setPicker(false)} />
            </DialogContent>
          </Dialog>
          <div className={uiClass(s.headerTitle)}>
            <div className={uiClass('rx-crumb')}>
              {educationLayout ? workspaceTitle : uiText.brand_name}
            </div>
            <HeaderHeading
              className={uiClass(s.pageTitle)}
              aria-label={
                heading?.title ??
                (home
                  ? uiText.navigation_education
                  : assistantRoot
                    ? uiText.navigation_assistant
                    : pageTitle)
              }
            >
              {heading ? (
                heading.title
              ) : home ? (
                <button
                  className={uiClass(s.titleSwitch)}
                  onClick={openPicker}
                  aria-label={uiText.text_ea58c94d0d26}
                >
                  {uiText.navigation_education}
                </button>
              ) : assistantRoot ? (
                uiText.navigation_assistant
              ) : (
                pageTitle
              )}
            </HeaderHeading>
            <p className={uiClass(s.headerSubtitle)}>
              {assistantRoot ? (
                uiText.text_e3ca4bcedb43
              ) : (
                <>
                  {workspaceTitle}
                  {uiText.text_78887da22764}{' '}
                  {session.context.activeRole
                    ? label(session.context.activeRole)
                    : uiText.text_d034f3bcfe7f}
                  {selectedChild ? ` · ${selectedChild.displayName}` : ''}
                </>
              )}
            </p>
          </div>
          <div className={uiClass(s.headerEnd)}>
            {heading?.action && <div className={uiClass(s.pageAction)}>{heading.action}</div>}
            {pathname === '/personal/profile' ? (
              <Button asChild size="icon" variant="ghost">
                <Link href="/personal/profile/preferences" aria-label={uiText.text_8aa6893911d9}>
                  <Settings size={21} />
                </Link>
              </Button>
            ) : (
              (educationLayout || messageLayout || pathname === '/personal/contacts') && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={educationLayout ? uiText.text_589d5004f227 : uiText.text_2a93eb7f06ce}
                  onClick={() => {
                    if (educationLayout) {
                      window.dispatchEvent(new Event('makan:education-sections'));
                      return;
                    }
                    const field = document.querySelector<HTMLInputElement>(
                      'main [role="search"] input',
                    );
                    if (field) field.focus();
                  }}
                >
                  {educationLayout ? <MoreHorizontal size={20} /> : <Search size={20} />}
                </Button>
              )
            )}
            {!messageLayout && !heading?.action && (
              <Button asChild size="icon" variant="ghost">
                <Link aria-label={uiText.text_9f2a436a61f3} href="/personal/notifications">
                  <Bell size={20} />
                </Link>
              </Button>
            )}
          </div>
        </header>
        <main
          ref={mainScroll}
          className={uiClass(
            `${s.main} ${messageLayout ? s.messageMain : ''} ${messagingPage && !messageLayout ? s.messagingPageMain : ''} ${pathname.startsWith('/personal/assistant') || pathname === '/personal/ai' ? s.assistantMain : ''}`,
          )}
          id="personal-content"
          aria-busy={(educationLayout && changing) || undefined}
        >
          <ProductContext.Provider
            value={{
              title: educationLayout ? workspaceTitle : uiText.brand_name,
              role: educationLayout ? domainRole : '',
              memoryKey: educationLayout ? session.revision : 'account',
            }}
          >
            {educationLayout && changing ? (
              <LoadingSkeleton />
            ) : (
              <div key={educationLayout ? session.revision : 'account'} className={s.contentScope}>
                {children}
              </div>
            )}
          </ProductContext.Provider>
        </main>
        {heading?.action && (
          <footer className={uiClass('v5-shell-actions rx-bottom-actions')}>
            {heading.action}
          </footer>
        )}
        <div className={uiClass(s.mobileNav)}>
          <AppNavigation presentation="dock" />
        </div>
      </div>
    </div>
  );
}
