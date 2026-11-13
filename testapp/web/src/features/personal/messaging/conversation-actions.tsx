'use client';
import { uiClass } from '@/components/v5/classes';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import * as uiText from '@/content/fa';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { Clock, Files, Info, Settings, Trash2, Eraser } from 'lucide-react';
import { MoreHorizontal } from './messenger-icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import t from './messaging-theme.module.css';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import { usePersonal } from '../provider';
import { scheduledComposerKey } from './rich-message-model';
type Summary = components['schemas']['ConversationSummaryResult'];
export type HistoryAction = 'clear' | 'remove';

export function ConversationActions({ summary, managed }: { summary: Summary; managed: boolean }) {
  const [action, setAction] = useState<HistoryAction | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = summary.conversationId;
  return (
    <>
      <Menu.Root dir="rtl">
        <Menu.Trigger asChild>
          <Button ref={trigger} size="icon" variant="ghost" aria-label={uiText.text_1e0263ee04dd}>
            <MoreHorizontal size={22} />
          </Button>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            className={uiClass(`dropdown ${t.theme} ${t.menu}`)}
            sideOffset={8}
            align="end"
            onCloseAutoFocus={(event) => {
              if (action) event.preventDefault();
            }}
          >
            <Menu.Item asChild>
              <Link href={`/personal/messages/${id}/info`}>
                <Info size={20} />
                {uiText.text_3a3510c0ba99}
              </Link>
            </Menu.Item>
            <Menu.Item asChild>
              <Link href={`/personal/messages/${id}/media`}>
                <Files size={20} />
                {uiText.text_563cba00d087}
              </Link>
            </Menu.Item>
            {managed && (
              <Menu.Item asChild>
                <Link href={`/personal/messages/${id}/settings`}>
                  <Settings size={20} />
                  {uiText.text_ad01ea1c94b6}
                </Link>
              </Menu.Item>
            )}
            <Menu.Item onSelect={() => setAction('clear')}>
              <Eraser size={20} />
              {uiText.messagingWorkflow.clearMessages}
            </Menu.Item>
            <Menu.Item data-destructive onSelect={() => setAction('remove')}>
              <Trash2 size={20} />
              {uiText.messagingWorkflow.deleteChat}
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
      {action && (
        <ConversationHistoryAction
          summary={summary}
          mode={action}
          onClose={() => {
            setAction(null);
            requestAnimationFrame(() => trigger.current?.focus());
          }}
        />
      )}
    </>
  );
}

/** Clearing is personal; removal uses the existing personal clear + archive contract. */
export function ConversationHistoryAction({
  summary,
  mode,
  onClose,
}: {
  summary: Summary;
  mode: HistoryAction;
  onClose: () => void;
}) {
  const { call, session } = usePersonal(),
    cache = useQueryClient(),
    router = useRouter();
  const [cleared, setCleared] = useState(false);
  const id = summary.conversationId;
  async function refresh() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ['personal', session.user.id, 'account'] }),
      cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] }),
    ]);
  }
  return (
    <ConfirmAction
      hideTrigger
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      trigger={uiText.messagingWorkflow.clearMessages}
      title={
        mode === 'clear'
          ? uiText.messagingWorkflow.clearMessages
          : uiText.messagingWorkflow.deleteChat
      }
      description={
        mode === 'clear' ? uiText.messagingWorkflow.clearHint : uiText.messagingWorkflow.deleteHint
      }
      confirm={
        mode === 'clear'
          ? uiText.messagingWorkflow.clearMessages
          : uiText.messagingWorkflow.deleteConfirm
      }
      destructive
      feedback={
        cleared && mode === 'remove' ? (
          <p role="status">{uiText.messagingWorkflow.archivePending}</p>
        ) : undefined
      }
      onConfirm={async () => {
        const scope = summary.scope === 'Personal' ? 'account' : 'context';
        if (!cleared) {
          const result = await call<components['schemas']['ConversationUserStateResult']>(
            `/api/v1/conversations/${id}/clear-history`,
            { method: 'POST', scope },
          );
          if (
            result.conversationId !== id ||
            !Number.isSafeInteger(result.historyHiddenThroughSequence) ||
            result.historyHiddenThroughSequence < (summary.lastMessageSequence ?? 0)
          )
            throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
          setCleared(true);
          await refresh();
        }
        if (mode === 'remove') {
          const result = await call<components['schemas']['ConversationUserStateResult']>(
            `/api/v1/conversations/${id}/archive`,
            { method: 'POST', scope },
          );
          if (result.conversationId !== id || !result.isArchived)
            throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
          await refresh();
          router.replace('/personal/messages?list=1');
        }
        return true;
      }}
    />
  );
}

/** A normal click submits once; a deliberate hold/context menu only exposes scheduling. */
export function ScheduledSendButton({
  id,
  text,
  disabled,
  className,
  children,
  scheduleDisabled = false,
}: {
  id: string;
  text: string;
  disabled: boolean;
  className: string;
  children: ReactNode;
  scheduleDisabled?: boolean;
}) {
  const { session } = usePersonal();
  const [open, setOpen] = useState(false);
  const held = useRef(false),
    openingRelease = useRef(false);
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  function cancel() {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  }
  useEffect(() => cancel, []);
  const canSchedule = !disabled && !scheduleDisabled;
  return (
    <Menu.Root dir="rtl" open={open} onOpenChange={setOpen}>
      <Menu.Trigger asChild>
        <button
          type="submit"
          className={className}
          disabled={disabled}
          aria-label={uiText.text_51dd685556b8}
          onPointerDown={(event) => {
            event.preventDefault();
            cancel();
            held.current = false;
            if (!canSchedule || event.button !== 0) return;
            press.current = {
              x: event.clientX,
              y: event.clientY,
              timer: setTimeout(() => {
                press.current = null;
                held.current = true;
                openingRelease.current = true;
                setOpen(true);
              }, 450),
            };
          }}
          onPointerMove={(event) => {
            if (
              press.current &&
              Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 10
            )
              cancel();
          }}
          onPointerUp={cancel}
          onPointerCancel={cancel}
          onPointerLeave={cancel}
          onContextMenu={(event) => {
            event.preventDefault();
            if (canSchedule) {
              held.current = true;
              openingRelease.current = true;
              setOpen(true);
            }
          }}
          onClick={(event) => {
            if (held.current || open) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
            if (event.key === 'ArrowDown' && !canSchedule) event.preventDefault();
          }}
        >
          {children}
        </button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          className={`dropdown ${t.theme} ${t.menu}`}
          aria-label={uiText.messagingWorkflow.sendOptions}
          side="top"
          align="end"
          sideOffset={8}
          onPointerDownCapture={() => {
            openingRelease.current = false;
          }}
          onPointerUpCapture={(event) => {
            if (openingRelease.current) {
              openingRelease.current = false;
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          <Menu.Item asChild>
            <Link
              href={`/personal/messages/${id}/scheduled?compose=1`}
              onClick={() => {
                try {
                  sessionStorage.setItem(
                    scheduledComposerKey(session.user.id, session.context.sessionId, id),
                    JSON.stringify({ text, at: Date.now() }),
                  );
                } catch {}
              }}
            >
              <Clock size={20} />
              {uiText.v4Text.schedule}
            </Link>
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
