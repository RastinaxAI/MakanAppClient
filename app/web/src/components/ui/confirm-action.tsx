'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useLayoutEffect, useRef, useState, cloneElement } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogTrigger } from './dialog';
import { ErrorState } from './states';
import type { ComponentProps, ReactNode, ReactElement } from 'react';

/** Keep the dialog and its retry action open until the server confirms the mutation. */
export function ConfirmAction({
  title,
  description,
  trigger,
  triggerIcon,
  triggerControl,
  confirm = uiText.text_df535a7ee41d,
  onConfirm,
  disabled = false,
  destructive = false,
  primaryFirst = false,
  scenario,
  feedback,
  onCloseAutoFocus,
  onOpenChange,
  open: controlledOpen,
  hideTrigger = false,
}: {
  title: string;
  description: string;
  trigger: string;
  triggerIcon?: ReactNode;
  triggerControl?: ReactElement<{ disabled?: boolean }>;
  confirm?: string;
  onConfirm: () => Promise<boolean>;
  disabled?: boolean;
  destructive?: boolean;
  primaryFirst?: boolean;
  scenario?: string;
  feedback?: ReactNode;
  onCloseAutoFocus?: ComponentProps<typeof DialogContent>['onCloseAutoFocus'];
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setOpenState] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false);
  const open = controlledOpen ?? internalOpen;
  useLayoutEffect(() => {
    if (open) setError(undefined);
  }, [open]);
  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) setOpenState(value);
    onOpenChange?.(value);
  };
  const cancel = (
    <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>
      {uiText.text_fa7af603d430}
    </Button>
  );
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!lock.current) {
          setOpen(v);
          setError(undefined);
        }
      }}
    >
      {!hideTrigger && (
        <DialogTrigger asChild>
          {triggerControl ? (
            cloneElement(triggerControl, { disabled: disabled || triggerControl.props.disabled })
          ) : (
            <Button
              type="button"
              variant={triggerIcon ? 'ghost' : destructive ? 'destructive' : 'outline'}
              size={triggerIcon ? 'icon' : 'default'}
              aria-label={triggerIcon ? trigger : undefined}
              title={triggerIcon ? trigger : undefined}
              disabled={disabled}
            >
              {triggerIcon || trigger}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        title={title}
        description={description}
        scenario={scenario}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <div className={uiClass('confirm-actions')}>
          {!primaryFirst && cancel}
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={busy || disabled}
            onClick={async () => {
              if (lock.current) return;
              lock.current = true;
              setBusy(true);
              setError(undefined);
              try {
                if (await onConfirm()) setOpen(false);
              } catch (problem) {
                setError(problem);
              } finally {
                lock.current = false;
                setBusy(false);
              }
            }}
          >
            {busy ? uiText.text_fc2867f048ea : confirm}
          </Button>
          {primaryFirst && cancel}
        </div>
        {!!error && <ErrorState error={error} />}
        {feedback}
      </DialogContent>
    </Dialog>
  );
}
