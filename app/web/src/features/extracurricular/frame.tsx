'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { usePersonal } from '@/features/personal/provider';
import { Button, buttonClass } from '@/components/ui/button';
import Link from 'next/link';
import { V5Scene } from '@/components/v5/scene';
import s from './connected.module.css';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SceneFooterPortal } from '@/components/v5/form-actions';
const base = '/personal/extracurricular';
export function useFrameActions() {
  const router = useRouter(),
    { session } = usePersonal();
  const [notice, setNotice] = useState('');
  const name =
    session.user.displayName ||
    [session.user.firstName, session.user.lastName].filter(Boolean).join(' ') ||
    uiText.text_8b4cb595cd35;
  return {
    name,
    notice,
    setNotice,
    router,
  };
}
export function FrameNotice({ message, close }: { message: string; close: () => void }) {
  return (
    <Dialog
      open={!!message}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent title={uiText.text_2224cd680a48}>
        <p>{message}</p>
        <div className={uiClass('confirm-actions')}>
          <Button onClick={close}>{uiText.text_b90ffe172b6d}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function StaticConnectedFrame({
  id,
  title,
  children,
  back = base,
  actions,
  menu,
  subtitle = uiText.text_22e1884c93fc,
  contextTitle,
  kind,
  mobileFooter,
}: {
  id: string;
  back?: string;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  menu?: ReactNode;
  subtitle?: string;
  contextTitle?: string;
  kind?: 'form' | 'list' | 'article' | 'dashboard' | 'status';
  mobileFooter?: ReactNode;
}) {
  return (
    <V5Scene
      id={id}
      title={title ?? uiText.navigation_extracurricular}
      back={back}
      subtitle={subtitle}
      contextTitle={contextTitle}
      kind={kind}
      footerSlot={!!mobileFooter}
      actions={actions}
      menu={
        menu ?? (
          <nav className={uiClass('stack')}>
            <Link className={uiClass(buttonClass('button button-outline'))} href={base}>
              {uiText.navigation_extracurricular}
            </Link>
            <Link
              className={uiClass(buttonClass('button button-outline'))}
              href={base + '/requests'}
            >
              {uiText.integration80c.requests}
            </Link>
          </nav>
        )
      }
    >
      <div className={uiClass('app-body ' + s.body)}>{children}</div>
      {mobileFooter && (
        <SceneFooterPortal>
          <div className={s.mobileFooter}>{mobileFooter}</div>
        </SceneFooterPortal>
      )}
    </V5Scene>
  );
}
