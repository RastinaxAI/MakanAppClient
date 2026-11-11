'use client';
import { Input as NativeInput, Textarea as NativeTextarea } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, UserMinus, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState, EmptyState, LoadingSkeleton } from '@/components/ui/states';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import c from './conversation-pages.module.css';
import t from './messaging-theme.module.css';
import { conversationCapability } from './management-policy';
import { ConversationEditorAction } from './conversation-action-slot';
import { V4Field, V4Note } from '@/components/v4/page';
import { useSceneContextSummary } from '@/components/v5/form-actions';
type S = components['schemas'];
export function ConversationInfoEditor({
  value,
  children,
}: {
  value: S['ManagedConversationResult'];
  children?: ReactNode;
}) {
  const setSceneAction = useContext(ConversationEditorAction);
  const { session, call } = usePersonal(),
    cache = useQueryClient();
  const [baseline, setBaseline] = useState({
    title: value.title,
    description: value.description ?? '',
    version: value.version,
  });
  const [title, setTitle] = useState(value.title),
    [description, setDescription] = useState(value.description ?? '');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [success, setSuccess] = useState(false);
  const lock = useRef(false),
    dirty = title !== baseline.title || description !== baseline.description,
    stale = baseline.version !== value.version;
  useUnsavedChanges(dirty);
  useEffect(() => {
    if (!dirty && baseline.version !== value.version) {
      setTitle(value.title);
      setDescription(value.description ?? '');
      setBaseline({
        title: value.title,
        description: value.description ?? '',
        version: value.version,
      });
    }
  }, [value, dirty, baseline.version]);
  const canEdit = conversationCapability(value, 'canEditInfo');
  const channel = value.type === 'Channel';
  const nameLabel = channel
    ? uiText.v5Product.channelEditorTitle
    : uiText.v5Product.groupEditorTitle;
  const descriptionLabel = channel
    ? uiText.v5Product.channelEditorDescription
    : uiText.v5Product.groupEditorDescription;
  useSceneContextSummary([
    { label: nameLabel, value: title },
    { label: descriptionLabel, value: description },
  ]);
  const save = useMemo(
    () =>
      canEdit ? (
        <Button
          type="submit"
          form="conversation-info-form"
          disabled={busy || stale || !dirty || !title.trim()}
          aria-busy={busy}
        >
          {channel ? uiText.v5Product.saveChannelInfo : uiText.v5Product.saveGroupInfo}
        </Button>
      ) : null,
    [canEdit, busy, stale, dirty, title, channel],
  );
  useEffect(() => {
    setSceneAction?.(save);
    return () => setSceneAction?.(null);
  }, [save, setSceneAction]);
  if (!canEdit)
    return (
      <section className={uiClass(c.panel)}>
        <EmptyState title={uiText.text_db45e600c458} />
      </section>
    );
  return (
    <section className={uiClass(c.nativeInfoEditor)}>
      {!setSceneAction && save}
      <form
        id="conversation-info-form"
        className={uiClass('v5-native-form')}
        onSubmit={async (ev) => {
          ev.preventDefault();
          if (lock.current || stale || !dirty || !title.trim()) return;
          lock.current = true;
          setBusy(true);
          setError(undefined);
          setSuccess(false);
          const key = [
            'personal',
            session.user.id,
            session.revision,
            '/api/v1/conversations/' + value.conversationId,
          ];
          try {
            const result = await call<S['ConversationInfoResult']>(
              '/api/v1/conversations/' + value.conversationId + '/info',
              {
                method: 'PATCH',
                body: JSON.stringify({
                  title: title.trim(),
                  description: description.trim() || null,
                  expectedVersion: baseline.version,
                }),
              },
            );
            if (result.conversationId !== value.conversationId)
              throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
            await cache.cancelQueries({ queryKey: key });
            cache.setQueryData<S['ManagedConversationResult']>(key, (old) =>
              old?.version === baseline.version ? { ...old, ...result } : old,
            );
            setTitle(result.title);
            setDescription(result.description ?? '');
            setBaseline({
              title: result.title,
              description: result.description ?? '',
              version: result.version,
            });
            setSuccess(true);
            void cache.invalidateQueries({
              queryKey: ['personal', session.user.id, session.revision],
            });
          } catch (err) {
            setError(err);
            if (err instanceof ApiError && [409, 412].includes(err.status))
              void cache.invalidateQueries({ queryKey: key });
          } finally {
            lock.current = false;
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy || stale} className={uiClass('v5-native-fields')}>
          <V4Field label={nameLabel}>
            <NativeInput
              required
              value={title}
              onChange={(ev) => {
                setTitle(ev.target.value);
                setSuccess(false);
              }}
            />
          </V4Field>
          <V4Field label={descriptionLabel}>
            <NativeTextarea
              rows={3}
              value={description}
              onChange={(ev) => {
                setDescription(ev.target.value);
                setSuccess(false);
              }}
            />
          </V4Field>
          {busy && <p role="status">{uiText.text_a143258455bb}</p>}
        </fieldset>
      </form>
      {children}
      <V4Note>
        {channel ? uiText.v5Product.channelInfoPolicy : uiText.v5Product.groupInfoPolicy}
      </V4Note>
      {stale && (
        <div role="alert">
          <p>{uiText.text_cb06ae591439}</p>
          <ConfirmAction
            title={uiText.text_acbe68adf3ef}
            trigger={uiText.text_aae95f355460}
            description={uiText.text_186123082d3d}
            onConfirm={async () => {
              setTitle(value.title);
              setDescription(value.description ?? '');
              setBaseline({
                title: value.title,
                description: value.description ?? '',
                version: value.version,
              });
              setError(undefined);
              return true;
            }}
          />
        </div>
      )}
      {!!error && <ErrorState error={error} />}
      {success && <p role="status">{uiText.text_197e7ea6aea8}</p>}
    </section>
  );
}
export function AddConversationMember({ value }: { value: S['ManagedConversationResult'] }) {
  const { session, call } = usePersonal(),
    cache = useQueryClient();
  const [open, setOpen] = useState(false),
    [page, setPage] = useState(1),
    [draft, setDraft] = useState(''),
    [q, setQ] = useState('');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false);
  const contacts = usePersonalApi<S['UserContactPageResult']>(
    '/api/v1/contacts?page=' + page + '&pageSize=20&favoritesOnly=false&q=' + encodeURIComponent(q),
    { enabled: open },
  );
  const existing = new Set(
    value.participants.filter((m) => m.status === 'Active').map((m) => m.user.userId),
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
      <DialogTrigger asChild>
        <Button data-conversation-member-add>{uiText.v5Product.invitePerson}</Button>
      </DialogTrigger>
      <DialogContent
        className={uiClass(`${t.theme}`)}
        title={uiText.v5Product.invitePerson}
        description={uiText.text_1ac1bbc54827}
        onCloseAutoFocus={(event) => {
          const trigger = [
            ...document.querySelectorAll<HTMLElement>('[data-conversation-member-add]'),
          ].find((node) => node.getBoundingClientRect().height);
          if (trigger) {
            event.preventDefault();
            trigger.focus();
          }
        }}
      >
        <form
          className={uiClass(c.search)}
          onSubmit={(ev) => {
            ev.preventDefault();
            setQ(draft.trim());
            setPage(1);
          }}
        >
          <Search size={18} />
          <NativeInput
            aria-label={uiText.text_a6c3837b1064}
            placeholder={uiText.text_d14da946f17b}
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
          />
          <Button type="submit" variant="ghost">
            {uiText.text_2a93eb7f06ce}
          </Button>
        </form>
        {contacts.isPending ? (
          <LoadingSkeleton />
        ) : contacts.isError ? (
          <ErrorState error={contacts.error} onRetry={() => void contacts.refetch()} />
        ) : (
          <div className={uiClass(c.memberPicker)}>
            {contacts.data.items
              .filter((m) => m.contactUserId !== session.user.id)
              .map((m) => (
                <article key={m.contactUserId}>
                  <span className={uiClass(c.avatar)}>
                    {(m.savedName || m.profile.displayName)[0]}
                  </span>
                  <strong>{m.savedName || m.profile.displayName}</strong>
                  <Button
                    size="sm"
                    disabled={busy || existing.has(m.contactUserId)}
                    onClick={async () => {
                      if (lock.current) return;
                      lock.current = true;
                      setBusy(true);
                      setError(undefined);
                      try {
                        const result = await call<S['ManagedConversationResult']>(
                          '/api/v1/conversations/' + value.conversationId + '/members',
                          { method: 'POST', body: JSON.stringify({ userId: m.contactUserId }) },
                        );
                        if (result.conversationId !== value.conversationId)
                          throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
                        await cache.invalidateQueries({
                          queryKey: ['personal', session.user.id, session.revision],
                        });
                        setOpen(false);
                      } catch (err) {
                        setError(err);
                      } finally {
                        lock.current = false;
                        setBusy(false);
                      }
                    }}
                  >
                    {existing.has(m.contactUserId)
                      ? uiText.text_35167823835d
                      : uiText.text_50c8d65df6bb}
                  </Button>
                </article>
              ))}
            {!contacts.data.items.length && <EmptyState title={uiText.text_fc5b13da691b} />}
          </div>
        )}
        {!!error && <ErrorState error={error} />}
        <div className={uiClass(c.pager)}>
          <Button
            variant="ghost"
            disabled={busy || page === 1 || contacts.isFetching}
            onClick={() => setPage(page - 1)}
          >
            {uiText.text_88e65319d694}
          </Button>
          <Button
            variant="ghost"
            disabled={busy || !contacts.data?.hasMore || contacts.isFetching}
            onClick={() => setPage(page + 1)}
          >
            {uiText.text_12ca1a58c6ca}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function MemberManagement({
  id,
  member,
  canManageAdmins = false,
  canManageMembers = false,
}: {
  id: string;
  member: S['ConversationParticipantResult'];
  canManageAdmins?: boolean;
  canManageMembers?: boolean;
}) {
  const { session, call } = usePersonal(),
    cache = useQueryClient();
  const [open, setOpen] = useState(false),
    [action, setAction] = useState<'Admin' | 'Member' | 'Remove' | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!lock.current) {
          setOpen(v);
          setAction(null);
          setError(undefined);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={uiText.text_aa46bc41d37e + member.user.displayName}
        >
          {member.role === 'Admin' ? (
            <span className={uiClass('badge')}>{uiText.v5Product.conversationAdmin}</span>
          ) : (
            <ChevronLeft size={18} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={uiClass(`${t.theme}`)}
        title={uiText.text_aa46bc41d37e + member.user.displayName}
        scenario={action === 'Remove' ? 'MK-208' : action ? 'MK-207' : undefined}
        description={uiText.text_eb33997cc70e}
      >
        {!action ? (
          <div className={uiClass(c.memberActions)}>
            {canManageAdmins && (
              <Button
                variant="ghost"
                onClick={() => setAction(member.role === 'Admin' ? 'Member' : 'Admin')}
              >
                <Shield size={20} />
                {member.role === 'Admin' ? uiText.text_9d2a510784b3 : uiText.text_8c33d1a8641b}
              </Button>
            )}
            {canManageMembers && (
              <Button
                variant="ghost"
                className={uiClass(c.danger)}
                onClick={() => setAction('Remove')}
              >
                <UserMinus size={20} />
                {uiText.text_464460abd037}
              </Button>
            )}
          </div>
        ) : (
          <>
            <p>
              {action === 'Remove'
                ? uiText.text_6b845561eedd
                : action === 'Admin'
                  ? uiText.text_a849795e6bcd
                  : uiText.text_12513980880d}
            </p>
            <div className={uiClass(c.pager)}>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setAction(null);
                  setError(undefined);
                }}
              >
                {uiText.common_back}
              </Button>
              <Button
                variant={action === 'Remove' ? 'destructive' : 'default'}
                disabled={busy}
                onClick={async () => {
                  if (lock.current) return;
                  lock.current = true;
                  setBusy(true);
                  setError(undefined);
                  try {
                    const result = await call<S['ManagedConversationResult']>(
                      '/api/v1/conversations/' +
                        id +
                        '/members/' +
                        member.user.userId +
                        (action === 'Remove' ? '' : '/role'),
                      {
                        method: action === 'Remove' ? 'DELETE' : 'PATCH',
                        ...(action !== 'Remove' ? { body: JSON.stringify({ role: action }) } : {}),
                      },
                    );
                    if (result.conversationId !== id)
                      throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
                    await cache.invalidateQueries({
                      queryKey: ['personal', session.user.id, session.revision],
                    });
                    setOpen(false);
                  } catch (err) {
                    setError(err);
                  } finally {
                    lock.current = false;
                    setBusy(false);
                  }
                }}
              >
                {busy ? uiText.text_b5ef00b1806f : uiText.text_21cd4c9cfde3}
              </Button>
            </div>
          </>
        )}
        {!!error && <ErrorState error={error} />}
      </DialogContent>
    </Dialog>
  );
}
