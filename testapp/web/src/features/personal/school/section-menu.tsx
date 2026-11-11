'use client';
import { uiClass } from '@/components/v5/classes';

import appearance from '@/features/reference/school.module.css';
import { buttonClass } from '@/components/ui/button';

import * as uiText from '@/content/fa';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
export function SchoolSectionMenu({
  children,
  inline = false,
  inlineContent,
}: {
  children: ReactNode;
  inline?: boolean;
  inlineContent?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const show = () => {
      trigger.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
    window.addEventListener('makan:education-sections', show);
    return () => window.removeEventListener('makan:education-sections', show);
  }, []);
  return (
    <>
      {inline && (
        <div className={uiClass('v5-school-inline ' + appearance.inline)}>
          {inlineContent ?? children}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title={uiText.text_589d5004f227}
          onCloseAutoFocus={(event) => {
            if (trigger.current?.isConnected && trigger.current.getBoundingClientRect().height) {
              event.preventDefault();
              trigger.current.focus();
            } else {
              const visible = [
                ...document.querySelectorAll<HTMLElement>('button[aria-label]'),
              ].find(
                (e) =>
                  e.getAttribute('aria-label') === uiText.text_589d5004f227 &&
                  e.getBoundingClientRect().height,
              );
              if (visible) {
                event.preventDefault();
                visible.focus();
              }
            }
          }}
        >
          <div
            className={uiClass('v4-school-sections')}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) setOpen(false);
            }}
          >
            {children}
            <Link
              className={uiClass(buttonClass('button button-outline'))}
              href="/personal/education/search"
            >
              <Search size={18} />
              {uiText.text_8e87c1832a1e}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
