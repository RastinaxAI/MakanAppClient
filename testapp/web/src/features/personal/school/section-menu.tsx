'use client';
import * as uiText from '@/content/fa';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
export function SchoolSectionMenu({
  children,
  inline = false,
}: {
  children: ReactNode;
  inline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
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
      {inline && <div className="v5-school-inline">{children}</div>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title={uiText.text_589d5004f227}
          onCloseAutoFocus={(event) => {
            if (trigger.current?.isConnected) {
              event.preventDefault();
              trigger.current.focus();
            }
          }}
        >
          <div
            className="v4-school-sections"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) setOpen(false);
            }}
          >
            {children}
            <Link className="button button-outline" href="/personal/education/search">
              <Search size={18} />
              {uiText.text_8e87c1832a1e}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
