'use client';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { Archive, Eye, Info, LogOut, Star, Trash2, Eraser } from 'lucide-react';
import { BellOff, MoreHorizontal } from './messenger-icons';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState } from '@/components/ui/states';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import * as fa from '@/content/fa';
import { usePersonal } from '../provider';
import { MuteAction } from './conversation-controls';
import { conversationTitle } from './model';
import { ProfileAvatar } from '../profile-photo';
import t from './messaging-theme.module.css';
import s from './inbox.module.css';
import { ConversationHistoryAction } from './conversation-actions';
type Summary = components['schemas']['ConversationSummaryResult'];

/** Navigation, pointer menu, long press and keyboard all act on the same confirmed inbox row. */
export function ConversationItem({
  row,
  href,
  selected,
  children,
  time,
  status,
}: {
  row: Summary;
  href: string;
  selected: boolean;
  children: ReactNode;
  time: ReactNode;
  status: ReactNode;
}) {
  const { call, session } = usePersonal();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const openingRelease = useRef(false);
  const [action, setAction] = useState<'mute' | 'archive' | 'leave' | 'clear' | 'remove' | null>(
    null,
  );
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const primaryLink = useRef<HTMLAnchorElement>(null);
  const lock = useRef(false);
  const held = useRef(false);
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  function cancelPress() {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  }
  useEffect(() => cancelPress, []);
  async function refresh() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ['personal', session.user.id, 'account'] }),
      cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] }),
    ]);
  }
  async function command(action: 'read' | 'unread' | 'favorite' | 'unmute') {
    if (lock.current || (action === 'read' && row.lastMessageSequence === null)) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    try {
      const endpoint =
        action === 'read'
          ? 'read'
          : action === 'unread'
            ? 'mark-unread'
            : action === 'favorite'
              ? 'state/pin'
              : 'mute';
      const result = await call<components['schemas']['ConversationUserStateResult'] | undefined>(
        `/api/v1/conversations/${row.conversationId}/${endpoint}`,
        {
          method:
            action === 'unmute' || (action === 'favorite' && row.isPinned) ? 'DELETE' : 'POST',
          scope: row.scope === 'Personal' ? 'account' : 'context',
          ...(action === 'read'
            ? { body: JSON.stringify({ upToMessageSequence: row.lastMessageSequence }) }
            : {}),
        },
      );
      if (
        action !== 'read' &&
        (!result ||
          result.conversationId !== row.conversationId ||
          (action === 'unread' && !result.isManuallyUnread) ||
          (action === 'favorite' && result.isPinned === row.isPinned) ||
          (action === 'unmute' && result.isMuted))
      )
        throw new Error(fa.text_c9d95977a264);
      await refresh();
    } catch (cause) {
      setError(cause);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function returnFocus() {
    requestAnimationFrame(() => trigger.current?.focus());
  }
  return (
    <>
      <Menu.Root dir="rtl" open={open} onOpenChange={setOpen}>
        <div className={`${s.itemContainer} ${selected ? s.selected : ''}`} data-inbox-row>
          <Link
            ref={primaryLink}
            href={href}
            className={s.chatItem}
            aria-current={selected ? 'page' : undefined}
            onContextMenu={(event) => {
              event.preventDefault();
              openingRelease.current = true;
              setOpen(true);
            }}
            onPointerDown={(event) => {
              cancelPress();
              held.current = false;
              if (event.pointerType !== 'touch') return;
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
                cancelPress();
            }}
            onPointerUp={cancelPress}
            onPointerCancel={cancelPress}
            onPointerLeave={cancelPress}
            onClick={(event) => {
              if (held.current) {
                event.preventDefault();
                held.current = false;
              }
            }}
          >
            {children}
          </Link>
          <div
            className={s.itemDetails}
            onClick={(event) => {
              if (!(event.target as HTMLElement).closest('button')) primaryLink.current?.click();
            }}
          >
            <div className={s.itemTime} data-inbox-time>
              {time}
              <Menu.Trigger asChild>
                <button
                  ref={trigger}
                  onPointerDownCapture={() => {
                    openingRelease.current = true;
                  }}
                  className={s.itemOptions}
                  aria-label={fa.text_1e0263ee04dd + ' ' + conversationTitle(row)}
                >
                  <MoreHorizontal size={18} />
                </button>
              </Menu.Trigger>
            </div>
            {status && <span className={s.itemStatus}>{status}</span>}
          </div>
        </div>
        <Menu.Portal>
          <div>
            {open && (
              <div className={t.menuBackdrop} aria-hidden onPointerDown={() => setOpen(false)} />
            )}
            <Menu.Content
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
              className={`dropdown ${t.theme} ${t.menu} mk-message-menu`}
              align="end"
              sideOffset={4}
              onCloseAutoFocus={(event) => {
                if (action) {
                  event.preventDefault();
                }
              }}
            >
              <div className={t.menuHeading}>
                <ProfileAvatar
                  name={conversationTitle(row)}
                  photo={row.otherParticipant?.profilePhoto}
                />
                {conversationTitle(row)}
              </div>
              <Menu.Item asChild>
                <Link href={`/personal/messages/${row.conversationId}/info`}>
                  <Info />
                  {fa.text_3a3510c0ba99}
                </Link>
              </Menu.Item>
              <Menu.Item onSelect={() => setAction('archive')}>
                <Archive />
                {row.isArchived ? fa.text_7961f47c1630 : fa.text_5c846bae22ae}
              </Menu.Item>
              <Menu.Item onSelect={() => setAction('clear')}>
                <Eraser />
                {fa.messagingWorkflow.clearMessages}
              </Menu.Item>
              <Menu.Item data-destructive onSelect={() => setAction('remove')}>
                <Trash2 />
                {fa.messagingWorkflow.deleteChat}
              </Menu.Item>
              <Menu.Item disabled={busy} onSelect={() => void command('favorite')}>
                <Star fill={row.isPinned ? 'currentColor' : 'none'} />
                {row.isPinned ? fa.messengerPdf.unfavorite : fa.messengerPdf.favorite}
              </Menu.Item>
              <Menu.Item
                disabled={
                  busy ||
                  ((row.unreadCount > 0 || row.isManuallyUnread) &&
                    row.lastMessageSequence === null)
                }
                onSelect={() =>
                  void command(row.unreadCount > 0 || row.isManuallyUnread ? 'read' : 'unread')
                }
              >
                <Eye />
                {row.unreadCount > 0 || row.isManuallyUnread
                  ? fa.messengerPdf.markRead
                  : fa.messengerPdf.markUnread}
              </Menu.Item>
              <Menu.Item
                onSelect={() => (row.isMuted ? void command('unmute') : setAction('mute'))}
              >
                <BellOff />
                {row.isMuted ? fa.text_db8eb8579dae : fa.text_16be3d3db4fc}
              </Menu.Item>
              {['Group', 'Channel'].includes(row.type) &&
                row.scope === 'Personal' &&
                !row.isOfficial &&
                !row.official && (
                  <Menu.Item data-destructive onSelect={() => setAction('leave')}>
                    <LogOut />
                    {fa.text_25e26909e1ab}
                  </Menu.Item>
                )}
            </Menu.Content>
          </div>
        </Menu.Portal>
      </Menu.Root>
      {!!error && <ErrorState error={error} />}
      {(action === 'clear' || action === 'remove') && (
        <ConversationHistoryAction
          summary={row}
          mode={action}
          onClose={() => {
            setAction(null);
            returnFocus();
          }}
        />
      )}
      {action === 'mute' && (
        <MuteAction
          summary={row}
          pickerOnly
          onClose={() => {
            setAction(null);
            returnFocus();
          }}
        />
      )}
      <ConfirmAction
        hideTrigger
        open={action === 'archive' || action === 'leave'}
        onOpenChange={(value) => {
          if (!value) {
            setAction(null);
            returnFocus();
          }
        }}
        title={
          action === 'leave'
            ? fa.text_9299c9dc14c6
            : row.isArchived
              ? fa.text_863dece374bf
              : fa.text_5c846bae22ae
        }
        description={action === 'leave' ? fa.text_2b09c8612d26 : fa.text_dc67b660687e}
        trigger={fa.text_5c846bae22ae}
        destructive={action === 'leave'}
        feedback={
          <div className={t.conversationPreview}>
            <strong>{conversationTitle(row)}</strong>
            {row.lastMessagePreview && <p>{row.lastMessagePreview}</p>}
          </div>
        }
        onConfirm={async () => {
          const result = await call<
            | components['schemas']['ConversationUserStateResult']
            | components['schemas']['ManagedConversationResult']
          >(
            `/api/v1/conversations/${row.conversationId}/${action === 'leave' ? 'leave' : 'archive'}`,
            {
              method: action === 'archive' && row.isArchived ? 'DELETE' : 'POST',
              scope: row.scope === 'Personal' ? 'account' : 'context',
            },
          );
          if (
            result.conversationId !== row.conversationId ||
            (action === 'archive' &&
              (!('isArchived' in result) || result.isArchived === row.isArchived)) ||
            (action === 'leave' &&
              (!('participants' in result) ||
                result.participants.some(
                  (member) => member.user.userId === session.user.id && member.status === 'Active',
                )))
          )
            throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
          await refresh();
          return true;
        }}
      />
    </>
  );
}
