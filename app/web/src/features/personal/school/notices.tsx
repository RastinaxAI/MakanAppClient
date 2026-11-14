'use client';
import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Megaphone, ShieldCheck, Plus, Paperclip } from 'lucide-react';
import { V5Scene } from '@/components/v5/scene';
import { useSceneFormAction } from '@/components/v5/form-actions';
import { Button } from '@/components/ui/button';
import { Input, Textarea, SearchField } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useViewState } from '@/components/hooks/use-view-state';
import { contextSignature } from '@/lib/client-surface';
import { ApiError } from '@/lib/api/errors';
import { date } from '@/lib/formatting';
import { v7Ui as t } from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import { readableOfficialEndpoint, type OfficialPair } from '../messaging/official-model';
import { personalMessageQueue, type QueuedMessage } from '../messaging/outbox';
import { base, Field } from './shared';
import s from './notices.module.css';
type S = components['schemas'];
function matchesSchool(pair: OfficialPair, organizationId: string | null) {
  return (
    pair.organizationId === organizationId &&
    pair.sourceKind === 'Organization' &&
    pair.sourceId === organizationId
  );
}
function canPublish(pair: OfficialPair) {
  return (
    readableOfficialEndpoint(pair, 'Channel') &&
    (pair.channel.effectiveCapabilities?.canPublish ?? pair.channel.capabilities.canSend)
  );
}
export function SchoolNotices({ compose = false }: { compose?: boolean }) {
  const { session } = usePersonal();
  const permitted = session.context.workspaceType === 'Organization';
  const q = usePersonalApi<OfficialPair>('/api/v1/organization/official-spaces', {
    enabled: permitted,
    poll: 10000,
  });
  const pair = q.data;
  const bound = !!pair && matchesSchool(pair, session.context.organizationId);
  return (
    <V5Scene
      id={compose ? 'ORG-39' : 'ORG-37'}
      title={compose ? t.publishNotice : t.schoolNoticesTitle}
      back={compose ? base + '/notices' : base}
      kind={compose ? 'form' : 'list'}
    >
      {!permitted ? (
        <ErrorState error={new ApiError(403)} />
      ) : q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : !bound ? (
        <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
      ) : !readableOfficialEndpoint(pair, 'Channel') ? (
        <EmptyState title={t.noOfficialChannel} description={t.channelAccessHint} />
      ) : compose && !canPublish(pair) ? (
        <ErrorState error={new ApiError(403)} />
      ) : (
        <NoticeChannel
          key={session.user.id + ':' + session.revision + ':' + pair.channel.conversationId}
          pair={pair}
          compose={compose}
        />
      )}
    </V5Scene>
  );
}
function NoticeChannel({ pair, compose }: { pair: OfficialPair; compose: boolean }) {
  const id = pair.channel.conversationId!;
  const [before, setBefore] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const q = usePersonalApi<S['ConversationMessagePageResult']>(
    `/api/v1/conversations/${id}/messages?limit=30${before === null ? '' : '&beforeSequence=' + before}`,
    { scope: 'context', poll: 10000 },
  );
  const items = q.data?.messages;
  const invalid = items?.some((message) => message.conversationId !== id);
  const selected = items?.find((message) => message.messageId === selectedId && !message.isDeleted);
  const visible = (items ?? [])
    .filter(
      (message) => !message.isDeleted && (!search.trim() || message.text?.includes(search.trim())),
    )
    .toSorted((a, b) => b.sequence - a.sequence);
  const href = '/personal/messages/' + id + '?from=' + encodeURIComponent(base + '/notices');
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  if (invalid) return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  if (compose) return <NoticeForm pair={pair} messages={items ?? []} />;
  return (
    <div className={s.stack} data-school-notices>
      <div className={s.context}>
        <ShieldCheck size={24} />
        <span>
          <b>{t.officialSchoolChannel}</b>
          <small>{t.noticeSource}</small>
        </span>
        <Button asChild variant="outline">
          <Link href={href}>{t.openChannel}</Link>
        </Button>
      </div>
      <SearchField
        aria-label={t.searchNotices}
        placeholder={t.searchNotices}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onClear={() => setSearch('')}
      />
      {canPublish(pair) && (
        <Button asChild>
          <Link href={base + '/notices/new'}>
            <Plus size={20} />
            {t.publishNotice}
          </Link>
        </Button>
      )}
      {visible.length ? (
        visible.map((message) => (
          <article key={message.messageId} className={s.notice}>
            <header>
              <Megaphone size={20} />
              <b>{message.sender.displayName}</b>
              <time dateTime={message.sentAtUtc}>{date(message.sentAtUtc, true)}</time>
            </header>
            <p dir="auto">{message.text || t.noticeAttachment}</p>
            {!!message.attachments.length && (
              <small>
                <Paperclip size={16} />
                {message.attachments.length.toLocaleString('fa-IR')} {t.attachments}
              </small>
            )}
            <Button variant="outline" onClick={() => setSelectedId(message.messageId)}>
              {t.noticeDetails}
            </Button>
          </article>
        ))
      ) : (
        <EmptyState title={search ? t.noNoticeMatch : t.noNotices} />
      )}
      <div className={s.actions}>
        {before !== null && (
          <Button variant="outline" onClick={() => setBefore(null)}>
            {t.latestNotices}
          </Button>
        )}
        {q.data?.nextBeforeSequence !== null && q.data?.nextBeforeSequence !== undefined && (
          <Button variant="outline" onClick={() => setBefore(q.data.nextBeforeSequence)}>
            {t.olderNotices}
          </Button>
        )}
      </div>
      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(undefined);
        }}
      >
        <DialogContent title={t.noticeDetails}>
          {selected ? (
            <div className={s.stack}>
              <p className={s.meta}>
                {t.officialSchoolChannel} · {date(selected.sentAtUtc, true)}
              </p>
              <p className={s.noticeText} dir="auto">
                {selected.text}
              </p>
              {!!selected.attachments.length && <p>{t.noticeAttachment}</p>}
              <Button asChild>
                <Link
                  href={href + '&message=' + selected.messageId + '&sequence=' + selected.sequence}
                >
                  {t.openChannel}
                </Link>
              </Button>
            </div>
          ) : (
            <p role="status">{t.noticeUnavailable}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function NoticeForm({
  pair,
  messages,
}: {
  pair: OfficialPair;
  messages: S['ConversationMessageResult'][];
}) {
  const { session, call } = usePersonal();
  const id = pair.channel.conversationId!;
  const scopeKey = contextSignature(session.context);
  const owner = { userId: session.user.id, conversationId: id, scopeKey };
  const [draft, setDraft, restored] = useViewState(
    owner.userId + ':' + scopeKey + ':school-notice:' + id,
    { title: '', body: '' },
    (value): value is { title: string; body: string } =>
      !!value &&
      typeof value === 'object' &&
      'title' in value &&
      typeof value.title === 'string' &&
      'body' in value &&
      typeof value.body === 'string',
  );
  const [noticeIntent, setNoticeIntent, intentReady] = useViewState(
    owner.userId + ':' + scopeKey + ':school-notice-intent:' + id,
    '',
    (value): value is string => typeof value === 'string',
  );
  const [pending, setPending] = useState<QueuedMessage | null>(null);
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false),
    alive = useRef(true);
  const formId = useId();
  useEffect(() => {
    alive.current = true;
    void personalMessageQueue
      .list(owner.userId, id, scopeKey)
      .then((rows) => {
        if (alive.current) {
          setPending(rows[0] ?? null);
          setReady(true);
        }
      })
      .catch((cause: unknown) => {
        if (alive.current) setError(cause);
      });
    return () => {
      alive.current = false;
    };
  }, [owner.userId, id, scopeKey]);
  const acknowledged =
    !!pending &&
    messages.some(
      (message) => message.clientMessageId === pending.id && message.conversationId === id,
    );
  const disabled = busy || !ready || !restored || !intentReady || !canPublish(pair);
  useSceneFormAction(
    useMemo(
      () => (
        <Button
          type="submit"
          form={formId}
          disabled={disabled || !!pending || !draft.title.trim() || !draft.body.trim()}
        >
          {t.publishNotice}
        </Button>
      ),
      [formId, disabled, pending, draft.title, draft.body],
    ),
  );
  async function publish(retry = false) {
    if (lock.current || disabled || (!retry && pending)) return;
    if (!retry && (!draft.title.trim() || !draft.body.trim())) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    setSent(false);
    const intent: QueuedMessage =
      retry && pending
        ? pending
        : {
            id: crypto.randomUUID(),
            ...owner,
            command: {},
            createdAt: new Date().toISOString(),
            state: 'sending',
          };
    if (!retry)
      intent.command = {
        clientMessageId: intent.id,
        kind: 'Text',
        text: draft.title.trim() + '\n\n' + draft.body.trim(),
        attachmentIds: null,
        replyToMessageId: null,
      };
    try {
      const fresh = await call<OfficialPair>('/api/v1/organization/official-spaces', {
        scope: 'context',
      });
      if (
        !matchesSchool(fresh, session.context.organizationId) ||
        fresh.channel.conversationId !== id ||
        !canPublish(fresh)
      )
        throw new ApiError(403);
      if (!alive.current) return;
      await personalMessageQueue.put(intent);
      if (!retry) setNoticeIntent(intent.id);
      setPending(intent);
      await personalMessageQueue.send(intent, owner, (command) =>
        call<S['MessageReceiptResult']>(`/api/v1/conversations/${id}/messages`, {
          method: 'POST',
          scope: 'context',
          body: JSON.stringify(command),
        }),
      );
      if (!alive.current) return;
      setPending(null);
      if (!retry || noticeIntent === intent.id) setDraft({ title: '', body: '' });
      setNoticeIntent('');
      setSent(true);
    } catch (cause) {
      if (alive.current) {
        setError(cause);
        const rows = await personalMessageQueue.list(owner.userId, id, scopeKey).catch(() => null);
        if (alive.current && rows) setPending(rows[0] ?? null);
      }
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <form
      id={formId}
      className={s.stack}
      data-school-notice-form
      onSubmit={(event) => {
        event.preventDefault();
        void publish();
      }}
    >
      <p className={s.meta}>
        <ShieldCheck size={18} />
        {t.noticeSource}
      </p>
      <Field label={t.noticeTitle}>
        <Input
          required
          maxLength={200}
          value={draft.title}
          disabled={disabled || !!pending}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
      </Field>
      <Field label={t.noticeBody}>
        <Textarea
          required
          maxLength={4000}
          value={draft.body}
          disabled={disabled || !!pending}
          onChange={(event) => setDraft({ ...draft, body: event.target.value })}
        />
      </Field>
      <p className={s.meta}>{t.noticePlainText}</p>
      <Button asChild variant="outline">
        <Link
          href={'/personal/messages/' + id + '?from=' + encodeURIComponent(base + '/notices/new')}
        >
          <Paperclip size={18} />
          {t.attachInChannel}
        </Link>
      </Button>
      {pending && (
        <div className={s.notice} role="status">
          <p>{acknowledged ? t.noticeAlreadySent : t.noticeUncertain}</p>
          <p dir="auto">{pending.command.text}</p>
          {!acknowledged && (
            <Button
              type="button"
              disabled={disabled || pending.retryable === false}
              onClick={() => void publish(true)}
            >
              {t.retryNotice}
            </Button>
          )}
          {acknowledged && (
            <Button
              type="button"
              disabled={busy}
              onClick={() => {
                void personalMessageQueue
                  .remove(pending.id)
                  .then(() => {
                    if (!alive.current) return;
                    if (noticeIntent === pending.id) setDraft({ title: '', body: '' });
                    setNoticeIntent('');
                    setPending(null);
                    setSent(true);
                  })
                  .catch(setError);
              }}
            >
              {t.closeNoticeReceipt}
            </Button>
          )}
        </div>
      )}
      {sent && <p role="status">{t.noticeSent}</p>}
      {!!error && <ErrorState error={error} />}
    </form>
  );
}
