'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { Forward, Bookmark, Flag } from 'lucide-react';
import {
  Info,
  Download,
  Copy,
  MoreHorizontal,
  Reply,
  Pin,
  SquarePen,
  Trash2,
  X,
} from './messenger-icons';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState } from '@/components/ui/states';
import { MessageActions, type MessageActionMode } from './message-actions';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { components } from '@/generated/api/schema';
import { ProfileAvatar } from '../profile-photo';
import Link from 'next/link';
import { messageLinks, fileTransferPath } from './media-model';
import { usePersonal } from '../provider';
import s from './messenger.module.css';
import t from './messaging-theme.module.css';
type MessageAuthor = Pick<
  components['schemas']['SafeMessagingIdentityResult'],
  'displayName' | 'profilePhoto'
>;

export function MessageBubble({
  children,
  own,
  sequence,
  text,
  onReply,
  sender,
  message,
  canForward = false,
  meta,
  onEdit,
  onDelete,
  onTogglePin,
  onRestoreFocus,
}: {
  children: ReactNode;
  own: boolean;
  sequence: number;
  text: string | null;
  onReply?: () => void;
  sender?: components['schemas']['SafeMessagingIdentityResult'];
  message?: components['schemas']['ConversationMessageResult'];
  canForward?: boolean;
  meta?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => Promise<boolean>;
  onTogglePin?: () => Promise<void>;
  onRestoreFocus?: () => void;
}) {
  const { transfer } = usePersonal();
  const downloadAbort = useRef<AbortController | null>(null);
  useEffect(() => () => downloadAbort.current?.abort(), []);
  const [open, setOpen] = useState(false);
  const openingRelease = useRef(false);
  const [notice, setNotice] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const pinLock = useRef(false);
  const editRequested = useRef(false);
  const [actionMode, setActionMode] = useState<MessageActionMode | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null),
    actionRequested = useRef(false);
  const replyRequested = useRef(false);
  const menuAvailable = !!text || !!onReply || (!!message && !message.isDeleted);
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  function cancelPress() {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  }
  useEffect(() => cancelPress, []);
  async function saveAttachment() {
    const asset = message?.attachments[0];
    if (!asset || !message || busy) return;
    setBusy(true);
    setError(undefined);
    const controller = new AbortController();
    downloadAbort.current = controller;
    try {
      const blob = await transfer<Blob>(
        fileTransferPath(message.conversationId, asset.fileAssetId, true),
        { binary: true, expectedBytes: asset.sizeBytes, signal: controller.signal },
      );
      controller.signal.throwIfAborted();
      const url = URL.createObjectURL(new Blob([blob], { type: asset.contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.download = asset.fileName;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(uiText.messengerPdf.downloadStarted);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return (
    <>
      <Menu.Root dir="rtl" open={open} onOpenChange={setOpen}>
        <article
          className={uiClass(`${s.bubble} ${own ? s.own : ''} ${sender ? s.feedMessage : ''}`)}
          data-message-state="history"
          data-message-origin={
            message?.originKind === 'System' && !message.academicActivity ? 'System' : undefined
          }
          data-message-id={message?.messageId}
          data-message-direction={own ? 'outgoing' : 'incoming'}
          onPointerDown={(event) => {
            cancelPress();
            if (
              event.pointerType !== 'touch' ||
              !menuAvailable ||
              (event.target as HTMLElement).closest('button,a,video,audio')
            )
              return;
            press.current = {
              x: event.clientX,
              y: event.clientY,
              timer: setTimeout(() => {
                press.current = null;
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
          onContextMenu={(event) => {
            if (menuAvailable) {
              event.preventDefault();
              openingRelease.current = true;
              setOpen(true);
            }
          }}
        >
          {message?.originKind === 'System' && !message.academicActivity && (
            <span className={s.systemMark} aria-label={uiText.messengerPdf.systemMessage}>
              <Info size={16} />
            </span>
          )}
          <MessageBody sender={sender} meta={meta}>
            {children}
            {notice && (
              <small className={uiClass(s.copyNotice)} role="status">
                {notice}
              </small>
            )}
          </MessageBody>
          {menuAvailable && (
            <Menu.Trigger asChild>
              <button
                ref={trigger}
                onPointerDownCapture={() => {
                  openingRelease.current = true;
                }}
                className={uiClass(s.messageOptions)}
                aria-label={uiText.text_712d44364071 + sequence}
              >
                <MoreHorizontal size={17} />
              </button>
            </Menu.Trigger>
          )}
        </article>
        <Menu.Portal>
          <div>
            {open && (
              <div
                className={uiClass(s.messageMenuBackdrop)}
                aria-hidden="true"
                onPointerDown={() => setOpen(false)}
              />
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
              className={uiClass(`dropdown ${t.theme} ${t.menu} mk-message-menu`)}
              sideOffset={6}
              align="end"
              onCloseAutoFocus={(event) => {
                if (editRequested.current) {
                  event.preventDefault();
                  editRequested.current = false;
                  onEdit?.();
                  return;
                }
                if (actionRequested.current) {
                  event.preventDefault();
                  actionRequested.current = false;
                  return;
                }
                if (replyRequested.current) {
                  event.preventDefault();
                  replyRequested.current = false;
                  onReply?.();
                }
              }}
            >
              <div className={uiClass(s.messageMenuTitle)}>{uiText.text_78ddf2493e4e}</div>
              {onEdit && (
                <Menu.Item
                  onSelect={() => {
                    editRequested.current = true;
                  }}
                >
                  <SquarePen size={16} />
                  {uiText.messengerPdf.editMessage}
                </Menu.Item>
              )}
              {onReply && (
                <Menu.Item
                  onSelect={() => {
                    replyRequested.current = true;
                  }}
                >
                  <Reply size={20} />
                  {uiText.text_a6340bbd29bf}
                </Menu.Item>
              )}
              {text && (
                <Menu.Item
                  onSelect={() => {
                    if (!navigator.clipboard) {
                      setNotice(uiText.text_97a497a7284d);
                      return;
                    }
                    void navigator.clipboard
                      .writeText(text)
                      .then(() => setNotice(uiText.text_02a2175c0160))
                      .catch(() => setNotice(uiText.text_e75b2f3a2657));
                  }}
                >
                  <Copy size={20} />
                  {uiText.text_fcc5b6fed863}
                </Menu.Item>
              )}
              {message && !message.isDeleted && message.attachments.length === 1 && (
                <Menu.Item disabled={busy} onSelect={() => void saveAttachment()}>
                  <Download size={16} />
                  {message.attachments[0].contentType.startsWith('image/')
                    ? uiText.messengerPdf.saveImage
                    : message.attachments[0].contentType.startsWith('video/')
                      ? uiText.messengerPdf.saveVideo
                      : uiText.messengerPdf.saveFile}
                </Menu.Item>
              )}
              {onTogglePin && (
                <Menu.Item
                  disabled={busy}
                  onSelect={() => {
                    if (pinLock.current) return;
                    pinLock.current = true;
                    setBusy(true);
                    setError(undefined);
                    void onTogglePin()
                      .catch(setError)
                      .finally(() => {
                        pinLock.current = false;
                        setBusy(false);
                      });
                  }}
                >
                  <Pin size={16} />
                  {message?.isPinned
                    ? uiText.messengerPdf.unpinMessage
                    : uiText.messengerPdf.pinMessage}
                </Menu.Item>
              )}
              {onDelete && (
                <Menu.Item
                  data-destructive
                  onSelect={() => {
                    actionRequested.current = true;
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 size={16} />
                  {uiText.messengerPdf.deleteMessage}
                </Menu.Item>
              )}
              {canForward &&
                (['forward', 'save'] as const).map((mode) => (
                  <Menu.Item
                    key={mode}
                    onSelect={() => {
                      actionRequested.current = true;
                      setActionMode(mode);
                    }}
                  >
                    {mode === 'forward' ? <Forward size={20} /> : <Bookmark size={20} />}{' '}
                    {mode === 'forward' ? uiText.text_ab182e469ee4 : uiText.text_479a5da6e735}
                  </Menu.Item>
                ))}
              {message && !message.isDeleted && (
                <Menu.Item
                  onSelect={() => {
                    actionRequested.current = true;
                    setActionMode('report');
                  }}
                >
                  <Flag size={20} />
                  {uiText.text_09d292dded16}
                </Menu.Item>
              )}
              <Menu.Item onSelect={() => setOpen(false)}>
                <X size={20} />
                {uiText.text_db4167d969dc}
              </Menu.Item>
            </Menu.Content>
          </div>
        </Menu.Portal>
      </Menu.Root>
      {!!error && <ErrorState error={error} />}
      {onDelete && (
        <ConfirmAction
          hideTrigger
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={uiText.messengerPdf.deleteMessage}
          description={uiText.messengerPdf.deleteDescription}
          trigger={uiText.messengerPdf.deleteMessage}
          confirm={uiText.messengerPdf.confirmDelete}
          destructive
          feedback={
            <div className={s.deletePreview}>
              <strong>{sender?.displayName}</strong>
              <p>{text}</p>
            </div>
          }
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (trigger.current?.isConnected) trigger.current.focus();
            else onRestoreFocus?.();
          }}
          onConfirm={onDelete}
        />
      )}
      {message && (
        <MessageActions
          mode={actionMode}
          message={message}
          onSuccess={setNotice}
          onClose={() => {
            setActionMode(null);
            requestAnimationFrame(() => trigger.current?.focus());
          }}
        />
      )}
    </>
  );
}

/** Keep local, confirmed and received group messages in the same geometry. */
export function MessageBody({
  sender,
  meta,
  children,
}: {
  sender?: MessageAuthor;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {sender && (
        <ProfileAvatar
          photo={sender.profilePhoto}
          name={sender.displayName}
          className={uiClass(s.senderAvatar)}
        />
      )}
      <div className={uiClass(s.messageContent)}>
        {sender && (
          <div className={s.authorLine}>
            {sender && (
              <strong className={uiClass(s.messageSender)} dir="auto">
                {sender.displayName}
              </strong>
            )}
          </div>
        )}
        {children}
        {meta}
      </div>
    </>
  );
}

export function MessageText({
  text,
  mentions = [],
}: {
  text: string;
  mentions?: components['schemas']['SafeMessagingIdentityResult'][];
}) {
  const people = new Map(
    mentions.flatMap((person) =>
      [person.username, person.displayName.replace(/\s+/g, '_')]
        .filter(Boolean)
        .map((key) => [key!.toLocaleLowerCase(), person] as const),
    ),
  );
  return (
    <p dir="auto">
      {text.split(/(https?:\/\/[^\s<>]+|@[\p{L}\p{N}._\u200c-]+)/giu).map((part, index) => {
        const url = /^https?:/i.test(part) ? messageLinks(part)[0] : undefined;
        if (url)
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={s.messageLink}
            >
              {part}
            </a>
          );
        const person = part.startsWith('@')
          ? people.get(part.slice(1).toLocaleLowerCase())
          : undefined;
        return person ? (
          <Link
            key={index}
            className={s.messageLink}
            href={'/personal/contacts?person=' + person.userId}
          >
            {part}
          </Link>
        ) : (
          part
        );
      })}
    </p>
  );
}
