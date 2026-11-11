'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useContext, useId, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Share2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { V4Field, V4List, V4Note, V4Row, V4SwitchRow } from '@/components/v4/page';
import {
  SceneMenuClose,
  useSceneContextSummary,
  useSceneFormAction,
  useSceneMenuTools,
} from '@/components/v5/form-actions';
import { ApiError } from '@/lib/api/errors';
import { date, localDateTime, number, utcDateTime } from '@/lib/formatting';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import { conversationCapability } from './management-policy';
import { inviteLinkState } from './invite-link-model';
import c from './conversation-pages.module.css';
type S = components['schemas'];
const t = uiText.v5Product;
const linkLabels = {
  active: t.inviteLinkActive,
  revoked: uiText.text_7a56ac65be94,
  expired: uiText.text_7f81e6534834,
  exhausted: uiText.text_4d36dcae4aa5,
};
function linkDescription(link: S['InviteLinkResult']) {
  return (
    date(link.expiresAtUtc, true) +
    ' · ' +
    number(link.usedCount) +
    ' / ' +
    number(link.maximumUses)
  );
}
/** Tokens are creation-only. Existing link ids never become public slugs. */
export function ConversationInviteLinks({ value }: { value: S['ManagedConversationResult'] }) {
  const { session, call } = usePersonal(),
    cache = useQueryClient();
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams();
  const creating = params.get('view') === 'new',
    requests = params.get('view') === 'requests';
  const [page, setPage] = useState(1),
    [uses, setUses] = useState('10');
  const [at, setAt] = useState(() => localDateTime(new Date(Date.now() + 86400000).toISOString()));
  const [approval, setApproval] = useState(false),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(),
    [invalid, setInvalid] = useState(false);
  const [created, setCreated] = useState<S['CreatedInviteLinkResult']>(),
    [feedback, setFeedback] = useState('');
  const lock = useRef(false),
    command = useRef<S['CreateInviteLinkCommand'] | null>(null);
  const form = useId(),
    closeMenu = useContext(SceneMenuClose);
  const base = `/api/v1/conversations/${value.conversationId}/invite-links`;
  const owner = conversationCapability(value, 'canManageInvites');
  const q = usePersonalApi<S['InviteLinkPageResult']>(`${base}?page=${page}&pageSize=30`, {
    enabled: owner && !creating && !requests,
    poll: 15000,
  });
  const refresh = () =>
    cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] });
  function navigate(view: string) {
    if (lock.current) return;
    closeMenu?.();
    const next = new URLSearchParams(params);
    if (view) next.set('view', view);
    else next.delete('view');
    router.push(path + (next.size ? '?' + next : ''), { scroll: false });
  }
  useSceneMenuTools(
    owner ? (
      <>
        {!creating && (
          <Button variant="outline" onClick={() => navigate('new')}>
            {uiText.text_52fb3fc1116c}
          </Button>
        )}
        {!requests && (
          <Button variant="outline" onClick={() => navigate('requests')}>
            {t.groupJoinRequestsTitle}
          </Button>
        )}
        {(creating || requests) && (
          <Button variant="outline" onClick={() => navigate('')}>
            {t.inviteLinksTitle}
          </Button>
        )}
      </>
    ) : null,
  );
  const submit = useMemo(
    () => (
      <Button type="submit" form={form} disabled={busy} aria-busy={busy}>
        {busy
          ? uiText.text_6b7a414cc01b
          : command.current
            ? uiText.text_8ea79cd585d1
            : t.createInviteLink}
      </Button>
    ),
    [form, busy, error],
  );
  const lifted = useSceneFormAction(submit, owner && creating);
  useSceneContextSummary(
    creating
      ? [
          { label: t.inviteLinkDeadline, value: at ? date(utcDateTime(at), true) : '' },
          { label: t.inviteLinkMaximumUses, value: uses ? number(Number(uses)) : '' },
        ]
      : (q.data?.items.every((link) => link.conversationId === value.conversationId)
          ? q.data.items
          : []
        ).map((link) => ({ label: uiText.text_01ecef85ebd9, value: linkDescription(link) })),
    owner && !requests,
  );
  if (!owner) return <EmptyState title={uiText.text_db54be8c6231} />;
  if (requests) return <JoinRequests value={value} />;
  if (creating)
    return (
      <form
        id={form}
        className={uiClass('v5-native-form')}
        onSubmit={async (event) => {
          event.preventDefault();
          if (lock.current) return;
          const expires = new Date(at),
            maximumUses = Number(uses);
          if (
            !command.current &&
            (!at ||
              !Number.isFinite(expires.getTime()) ||
              expires.getTime() <= Date.now() ||
              !Number.isSafeInteger(maximumUses) ||
              maximumUses < 1 ||
              maximumUses > 2147483647)
          ) {
            setInvalid(true);
            return;
          }
          lock.current = true;
          setBusy(true);
          setError(undefined);
          setInvalid(false);
          command.current ??= {
            clientLinkId: crypto.randomUUID(),
            expiresAtUtc: expires.toISOString(),
            maximumUses,
            requiresApproval: approval,
          };
          try {
            const result = await call<S['CreatedInviteLinkResult']>(base, {
              method: 'POST',
              body: JSON.stringify(command.current),
            });
            if (result.link.conversationId !== value.conversationId)
              throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
            setCreated(result);
            command.current = null;
            await refresh();
            // Release the command lock before the acknowledged return to the list.
            lock.current = false;
            navigate('');
          } catch (err) {
            setError(err);
            if (err instanceof ApiError && [400, 403, 422].includes(err.status))
              command.current = null;
          } finally {
            lock.current = false;
            setBusy(false);
          }
        }}
      >
        <fieldset className={uiClass('v5-native-fields')} disabled={busy || !!command.current}>
          <V4Field label={t.inviteLinkDeadline} hint={uiText.v4Text.localTime}>
            <JalaliDateInput withTime required value={at} onValueChange={setAt} />
          </V4Field>
          <V4Field label={t.inviteLinkMaximumUses}>
            <NativeInput
              type="number"
              min="1"
              max="2147483647"
              step="1"
              required
              value={uses}
              onChange={(event) => setUses(event.target.value)}
            />
          </V4Field>
          <V4List>
            <V4SwitchRow
              title={t.inviteLinkApproval}
              description={t.inviteLinkApprovalHint}
              checked={approval}
              onCheckedChange={setApproval}
              disabled={busy || !!command.current}
            />
          </V4List>
          <V4Note>{t.inviteLinkFormPolicy}</V4Note>
        </fieldset>
        {invalid && (
          <p role="alert" className={uiClass('field-error')}>
            {t.inviteLinkInvalid}
          </p>
        )}
        {command.current && <p className={uiClass('policy')}>{uiText.text_5db8879fe0d3}</p>}
        {!!error && <ErrorState error={error} />}
        {!lifted && submit}
      </form>
    );
  const url = created?.token
    ? `${typeof location === 'undefined' ? '' : location.origin}/personal/messages/join#token=${encodeURIComponent(created.token)}`
    : null;
  return (
    <>
      {created && (
        <section className={uiClass('card ' + c.inviteCard)}>
          <h2>{uiText.text_c82f98b3969b}</h2>
          {url ? (
            <>
              <NativeInput aria-label={uiText.text_fbb4e2588109} readOnly value={url} dir="ltr" />
              <div className={uiClass(c.shareActions)}>
                <Button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url);
                      setFeedback(uiText.text_d5019c056b53);
                    } catch {
                      setFeedback(uiText.text_83a9db1ceb63);
                    }
                  }}
                >
                  <Copy size={18} />
                  {uiText.text_3b907474a390}
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (navigator.share) await navigator.share({ title: value.title, url });
                      else {
                        await navigator.clipboard.writeText(url);
                        setFeedback(uiText.text_069812fe4aca);
                      }
                    } catch {
                      setFeedback(uiText.text_664cd187c8b4);
                    }
                  }}
                >
                  <Share2 size={18} />
                  {uiText.text_075b83ebe614}
                </Button>
              </div>
            </>
          ) : (
            <p>{uiText.text_a0cb26a781b7}</p>
          )}
          <p className={uiClass('policy')}>{uiText.text_5317ef2d15be}</p>
        </section>
      )}
      {feedback && <p role="status">{feedback}</p>}
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : q.data.items.some((link) => link.conversationId !== value.conversationId) ? (
        <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
      ) : (
        <>
          <V4List>
            {q.data.items.map((link) => (
              <V4Row
                key={link.id}
                title={uiText.text_01ecef85ebd9}
                description={linkDescription(link)}
                icon={<Link2 />}
                end={
                  !link.revokedAtUtc ? (
                    <ConfirmAction
                      scenario="MK-217"
                      destructive
                      title={uiText.text_3f33c72118c4}
                      trigger={uiText.text_e1fd59fc4069}
                      description={uiText.text_003b1c0a04e4}
                      triggerControl={
                        <button
                          type="button"
                          className={uiClass('v5-status-control')}
                          aria-label={uiText.text_e1fd59fc4069}
                          title={
                            link.requiresApproval
                              ? uiText.text_8828599b0d27
                              : uiText.text_db1beec49bc6
                          }
                        >
                          <span className={uiClass('badge')}>
                            {linkLabels[inviteLinkState(link)]}
                          </span>
                        </button>
                      }
                      onConfirm={async () => {
                        const result = await call<S['InviteLinkResult']>(
                          `${base}/${link.id}/revoke`,
                          {
                            method: 'POST',
                            body: JSON.stringify({ expectedVersion: link.version }),
                          },
                        );
                        if (
                          result.id !== link.id ||
                          result.conversationId !== value.conversationId ||
                          !result.revokedAtUtc
                        )
                          throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
                        if (created?.link.id === link.id) setCreated(undefined);
                        await refresh();
                        return true;
                      }}
                    />
                  ) : (
                    <span className={uiClass('badge')}>{linkLabels.revoked}</span>
                  )
                }
              />
            ))}
          </V4List>
          {!q.data.items.length && (
            <EmptyState
              variant="v5"
              icon={<Link2 />}
              title={uiText.text_8009dd2a1225}
              action={<Button onClick={() => navigate('new')}>{uiText.text_52fb3fc1116c}</Button>}
            />
          )}
          {(page > 1 || q.data.hasMore) && (
            <div className={uiClass(c.pager)}>
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {uiText.text_28d94a2716a9}
              </Button>
              <span>
                {uiText.text_2714496eef16}
                {number(page)}
              </span>
              <Button
                variant="outline"
                disabled={!q.data.hasMore}
                onClick={() => setPage(page + 1)}
              >
                {uiText.text_a381bb5c90e2}
              </Button>
            </div>
          )}
        </>
      )}
      <p className={uiClass('policy')}>{t.inviteLinksPolicy}</p>
    </>
  );
}
function requestLabel(item: S['ConversationJoinRequestResult2']) {
  return item.status === 'Pending'
    ? uiText.text_e81c80fd6d5f
    : item.status === 'Approved'
      ? uiText.text_479574e266a4
      : item.status === 'Rejected'
        ? uiText.text_c7009e8ab420
        : item.status === 'Expired'
          ? uiText.text_7f81e6534834
          : uiText.text_7a56ac65be94;
}
function JoinRequests({ value }: { value: S['ManagedConversationResult'] }) {
  const { call, session } = usePersonal(),
    cache = useQueryClient();
  const [page, setPage] = useState(1),
    [selected, setSelected] = useState<S['ConversationJoinRequestResult2']>();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false);
  const q = usePersonalApi<S['ConversationJoinRequestPageResult']>(
    `/api/v1/conversations/${value.conversationId}/join-requests?page=${page}&pageSize=30`,
    { poll: 10000 },
  );
  const first = q.data?.items.find(
    (item) => item.status === 'Pending' && item.conversationId === value.conversationId,
  );
  const review = useMemo(
    () =>
      first ? (
        <Button
          onClick={() => {
            setSelected(first);
            setError(undefined);
          }}
        >
          {t.reviewJoinRequest}
        </Button>
      ) : null,
    [first],
  );
  const lifted = useSceneFormAction(review);
  useSceneContextSummary(
    q.data?.items
      .filter((item) => item.conversationId === value.conversationId)
      .map((item) => ({ label: uiText.text_2abca77097a6, value: requestLabel(item) })) ?? [],
  );
  async function decide(action: 'approve' | 'reject') {
    if (!selected || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    try {
      const result = await call<S['ConversationJoinRequestResult2']>(
        `/api/v1/messaging/join-requests/${selected.id}/${action}`,
        { method: 'POST', body: JSON.stringify({ expectedVersion: selected.version }) },
      );
      if (
        result.id !== selected.id ||
        result.userId !== selected.userId ||
        result.conversationId !== value.conversationId ||
        result.status !== (action === 'approve' ? 'Approved' : 'Rejected')
      )
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      setSelected(undefined);
      void cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] });
    } catch (err) {
      setError(err);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : q.data.items.some((item) => item.conversationId !== value.conversationId) ? (
        <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
      ) : (
        <>
          <V4List>
            {q.data.items.map((item) => (
              <JoinRequestRow
                key={item.id}
                item={item}
                onOpen={() => {
                  setSelected(item);
                  setError(undefined);
                }}
              />
            ))}
          </V4List>
          {!q.data.items.length && <EmptyState variant="v5" title={uiText.text_5e52f10bb784} />}
          <div className={uiClass('card')}>
            <div className={uiClass('kv')}>
              <span className={uiClass('key')}>{uiText.text_4172b29c8925}</span>
              <span className={uiClass('val')}>{value.title}</span>
            </div>
          </div>
          {(page > 1 || q.data.hasMore) && (
            <div className={uiClass(c.pager)}>
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {uiText.text_320b8978731f}
              </Button>
              <Button
                variant="outline"
                disabled={!q.data.hasMore}
                onClick={() => setPage(page + 1)}
              >
                {uiText.text_0d27a1d50d56}
              </Button>
            </div>
          )}
        </>
      )}
      {!lifted && review}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!lock.current && !open) {
            setSelected(undefined);
            setError(undefined);
          }
        }}
      >
        <DialogContent
          title={t.reviewJoinRequest}
          description={uiText.text_c356dfccba3c}
          footer={
            <div className={uiClass('confirm-actions')}>
              <Button variant="outline" disabled={busy} onClick={() => setSelected(undefined)}>
                {uiText.text_fa7af603d430}
              </Button>
              <Button
                variant="destructive"
                disabled={busy || selected?.status !== 'Pending'}
                onClick={() => void decide('reject')}
              >
                {uiText.text_cc522e594117}
              </Button>
              <Button
                disabled={busy || selected?.status !== 'Pending'}
                onClick={() => void decide('approve')}
              >
                {uiText.text_df535a7ee41d}
              </Button>
            </div>
          }
        >
          {selected && (
            <>
              <JoinRequestIdentity item={selected} />
              <p>{requestLabel(selected)}</p>
              <p>{date(selected.createdAtUtc, true)}</p>
            </>
          )}
          {!!error && <ErrorState error={error} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
function JoinRequestRow({
  item,
  onOpen,
}: {
  item: S['ConversationJoinRequestResult2'];
  onOpen: () => void;
}) {
  const name = useJoinRequestName(item);
  return (
    <V4Row
      title={name || uiText.text_2abca77097a6}
      description={date(item.createdAtUtc, true)}
      iconClassName="avatar"
      icon={name ? Array.from(name)[0] : <Link2 />}
      onClick={onOpen}
      end={<span className={uiClass('badge')}>{requestLabel(item)}</span>}
    />
  );
}
function JoinRequestIdentity({ item }: { item: S['ConversationJoinRequestResult2'] }) {
  const name = useJoinRequestName(item);
  return <h3>{name || uiText.text_2abca77097a6}</h3>;
}
function useJoinRequestName(item: S['ConversationJoinRequestResult2']) {
  const { session } = usePersonal();
  const profile = usePersonalApi<S['MessagingPublicProfileResult']>(
    '/api/v1/people/' + item.userId,
    { enabled: session.user.id !== item.userId },
  );
  return item.userId === session.user.id
    ? session.user.displayName || session.user.firstName
    : profile.data?.userId === item.userId
      ? profile.data.displayName
      : undefined;
}
