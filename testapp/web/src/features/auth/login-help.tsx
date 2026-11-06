'use client';
import * as uiText from '@/content/fa';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { RefObject } from 'react';
export default function LoginHelp({
  onClose,
  returnFocus,
}: {
  onClose: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        title={uiText.text_b55a7e83c439}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <p>{uiText.text_a55bf6a5c36c}</p>
      </DialogContent>
    </Dialog>
  );
}
