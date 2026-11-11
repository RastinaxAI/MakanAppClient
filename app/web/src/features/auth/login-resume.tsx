'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

/** Only mounted after the existing provider has preserved an expired-session destination. */
export default function LoginResume({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        title={uiText.text_b5e55332516d}
        scenario="MK-437"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          (document.getElementById('otp-code') || document.getElementById('phone-number'))?.focus();
        }}
      >
        <p className={uiClass('dialog-policy')}>{uiText.text_d8b2159d59fd}</p>
        <div className={uiClass('confirm-actions')}>
          <Button type="button" variant="outline" onClick={onClose}>
            {uiText.v4Text.cancel}
          </Button>
          <Button type="button" onClick={onClose}>
            {uiText.text_9b009e657294}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
