'use client';
import { uiClass } from '@/components/v5/classes';

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { unsavedNavigation as t } from '@/content/fa';
import type { UnsavedNavigation } from '@/components/hooks/use-unsaved-changes';

/** In-app navigation can be reviewed in the product; browser unload keeps its native guard. */
export function UnsavedNavigationDialog() {
  const [pending, setPending] = useState<UnsavedNavigation | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const ask = (event: Event) => {
      const question = event as CustomEvent<UnsavedNavigation>;
      event.preventDefault();
      trigger.current = question.detail.trigger;
      setPending(question.detail);
    };
    window.addEventListener('makan:unsaved-navigation', ask);
    return () => window.removeEventListener('makan:unsaved-navigation', ask);
  }, []);
  function leave(discard = false) {
    if (!pending) return;
    const navigation = pending;
    if (discard) navigation.discard?.();
    setPending(null);
    navigation.continue();
  }
  return (
    <Dialog
      open={!!pending}
      onOpenChange={(open) => {
        if (!open) setPending(null);
      }}
    >
      <DialogContent
        scenario={pending?.discard ? 'MK-430 RX-057' : 'MK-430'}
        title={t.title}
        description={t.description}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (trigger.current?.isConnected) trigger.current.focus();
        }}
      >
        <div className={uiClass('confirm-actions')} data-unsaved-navigation>
          <Button onClick={() => setPending(null)}>{t.continueEditing}</Button>
          <Button variant="outline" onClick={() => leave()}>
            {t.leaveWithoutSaving}
          </Button>
          {pending?.discard && (
            <Button variant="destructive" onClick={() => leave(true)}>
              {t.discardAndLeave}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
