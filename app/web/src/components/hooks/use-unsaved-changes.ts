'use client';
import * as uiText from '@/content/fa';
import { useEffect, useRef } from 'react';

export type UnsavedNavigation = {
  trigger: HTMLElement;
  continue: () => void;
  discard?: () => void;
};
let replayingNavigation = false;

/** Protect links, explicit navigation controls and unload; forms persist their own drafts. */
export function useUnsavedChanges(dirty: boolean, discard?: () => void) {
  const discardCurrent = useRef(discard);
  discardCurrent.current = discard;
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => event.preventDefault();
    const follow = (event: MouseEvent) => {
      if (
        replayingNavigation ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target;
      const link = target instanceof Element ? target.closest('a[href]') : null;
      const navigation =
        target instanceof Element ? target.closest('button[data-navigation-target]') : null;
      const destination =
        link instanceof HTMLAnchorElement &&
        !link.hasAttribute('download') &&
        link.target !== '_blank' &&
        !link.getAttribute('href')?.startsWith('#')
          ? link
          : navigation instanceof HTMLElement
            ? navigation
            : null;
      if (destination) {
        const question = new CustomEvent<UnsavedNavigation>('makan:unsaved-navigation', {
          cancelable: true,
          detail: {
            trigger: destination,
            continue: () => {
              replayingNavigation = true;
              try {
                destination.click();
              } finally {
                replayingNavigation = false;
              }
            },
            ...(discardCurrent.current ? { discard: () => discardCurrent.current?.() } : {}),
          },
        });
        window.dispatchEvent(question);
        if (!question.defaultPrevented && window.confirm(uiText.text_afe183ddd169)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', follow, true);
    return () => {
      window.removeEventListener('beforeunload', unload);
      document.removeEventListener('click', follow, true);
    };
  }, [dirty]);
}
