'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import {
  messagingInvitations as t,
  v71Ui as u,
  text_197ebc70e3d9,
  text_028b3c5809be,
} from '@/content/fa';
import { Button } from '@/components/ui/button';
import { V5Scene } from '@/components/v5/scene';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { date, number } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { invitationCanBeAnswered, validInvitationReceipt } from './invitation-model';
import { messagingReturnPath } from './inbox-model';
import { ConversationAvatar } from './conversation-photo';
import { conversationTitle } from './model';
import { OfficialBadge } from './official';
import s from './received-invitations.module.css';
type S = components['schemas'];
type Invitation = S['ConversationInvitationResult'];
const path = '/api/v1/messaging/invitations';

/** Header and destination share the same account query and expiry rules. */
function useReceivedInvitations() {
  const { session } = usePersonal();
  const query = usePersonalApi<Invitation[]>(path, { poll: 10000 });
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);
  const received = (query.data ?? []).filter((item) => item.targetUserId === session.user.id);
  // A failed refresh is unknown, not a freshly verified zero or a stale badge.
  const pendingCount = query.isSuccess
    ? received.filter((item) => invitationCanBeAnswered(item, session.user.id, now)).length
    : null;
  return { query, received, pendingCount, now };
}
export function MessagingInvitationsLink({
  returnPath,
  className,
}: {
  returnPath: string;
  className: string;
}) {
  const { query, pendingCount } = useReceivedInvitations();
  return (
    <Link
      href={
        '/personal/messages/invitations?' +
        new URLSearchParams({ from: messagingReturnPath(returnPath) })
      }
      className={className}
      title={u.invitations}
      aria-label={pendingCount === null ? u.invitations : u.invitationCount(number(pendingCount))}
      aria-busy={query.isPending || undefined}
      data-messaging-invitations-entry
    >
      <Mail size={22} aria-hidden="true" />
      {pendingCount !== null && pendingCount > 0 && (
        <b className={s.badge} aria-hidden="true">
          {number(pendingCount)}
        </b>
      )}
    </Link>
  );
}
export function MessagingInvitationsPage() {
  const { session, call } = usePersonal(),
    cache = useQueryClient(),
    router = useRouter();
  const back = messagingReturnPath(useSearchParams().get('from'));
  const { query: invitations, received, now } = useReceivedInvitations();
  const lock = useRef(false);
  const [busy, setBusy] = useState<string | null>(null),
    [error, setError] = useState<unknown>();
  async function answer(item: Invitation, decision: 'accept' | 'decline') {
    if (lock.current || !invitationCanBeAnswered(item, session.user.id)) return;
    lock.current = true;
    setBusy(item.id);
    setError(undefined);
    try {
      const result = await call<Invitation>(`${path}/${item.id}/${decision}`, { method: 'POST' });
      if (!validInvitationReceipt(item, result, decision))
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      cache.setQueryData<Invitation[]>(['personal', session.user.id, 'account', path], (items) =>
        items?.map((old) => (old.id === item.id ? result : old)),
      );
      await cache.invalidateQueries({ queryKey: ['personal', session.user.id, 'account'] });
      if (decision === 'accept')
        router.push(
          '/personal/messages/' + result.conversationId + '?' + new URLSearchParams({ from: back }),
        );
    } catch (problem) {
      setError(problem);
      // Only an authoritative read can resolve an ambiguous write; no automatic POST retry.
      void invitations.refetch();
    } finally {
      setBusy(null);
      lock.current = false;
    }
  }
  return (
    <V5Scene
      id="UPD71-MSG-INVITES"
      title={t.title}
      subtitle={u.receivedInvitations}
      back={back}
      kind="list"
      deep
    >
      <section className={s.body} data-messaging-invitations>
        <p>{t.explanation}</p>
        {invitations.isPending ? (
          <LoadingSkeleton />
        ) : invitations.isError ? (
          <ErrorState error={invitations.error} onRetry={() => void invitations.refetch()} />
        ) : !received.length ? (
          <EmptyState title={u.noInvitations} />
        ) : (
          received.map((item, index) => (
            <InvitationCard
              key={item.id}
              item={item}
              index={index}
              now={now}
              busy={busy}
              onAnswer={answer}
            />
          ))
        )}
        {!!error && <ErrorState error={error} />}
        <Button
          type="button"
          variant="ghost"
          disabled={busy !== null || invitations.isFetching}
          onClick={() => void invitations.refetch()}
        >
          {t.refresh}
        </Button>
      </section>
    </V5Scene>
  );
}
function InvitationCard({
  item,
  index,
  now,
  busy,
  onAnswer,
}: {
  item: Invitation;
  index: number;
  now: number;
  busy: string | null;
  onAnswer: (item: Invitation, decision: 'accept' | 'decline') => Promise<void>;
}) {
  const { session } = usePersonal();
  const ref = useRef<HTMLElement>(null),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '160px' },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  // These reads still pass the existing BFF and ACL. The invitation DTO alone has no
  // title, photo, type or inviter name. A denied read must not invent that identity.
  const details = usePersonalApi<S['ConversationSummaryResult']>(
    `/api/v1/conversations/${item.conversationId}/summary`,
    { enabled: visible },
  );
  const inviter = usePersonalApi<S['MessagingPublicProfileResult']>(
    `/api/v1/people/${item.inviterUserId}`,
    { enabled: visible },
  );
  const summary =
    details.isSuccess &&
    details.data.conversationId === item.conversationId &&
    (details.data.type === 'Group' || details.data.type === 'Channel')
      ? details.data
      : undefined;
  const person =
    inviter.isSuccess && inviter.data.userId === item.inviterUserId ? inviter.data : undefined;
  const title = summary ? conversationTitle(summary) : u.invitationTitle;
  const expired = item.status === 'Pending' && Date.parse(item.expiresAtUtc) <= now;
  const status = expired ? u.invitationStatuses.Expired : u.invitationStatuses[item.status];
  return (
    <article
      ref={ref}
      className={s.card}
      aria-label={t.received + ' ' + number(index + 1)}
      data-invitation-status={expired ? 'Expired' : item.status}
    >
      <div className={s.identity}>
        <ConversationAvatar
          id={item.conversationId}
          name={title}
          photo={summary?.photo}
          className={s.avatar}
        />
        <div>
          <h2 dir="auto">{title}</h2>
          {summary && (
            <>
              <p>
                {summary.type === 'Channel'
                  ? text_028b3c5809be
                  : summary.type === 'Group'
                    ? text_197ebc70e3d9
                    : ''}
              </p>
              <OfficialBadge summary={summary} />
            </>
          )}
        </div>
      </div>
      {!summary && <p>{u.invitationDetailsUnavailable}</p>}
      {person && (
        <p>
          {u.invitedBy} <bdi>{person.displayName}</bdi>
        </p>
      )}
      <p role="status">{busy === item.id ? t.busy : (status ?? u.unknownInvitationStatus)}</p>
      <p>
        {t.expires} {date(item.expiresAtUtc, true)}
      </p>
      {invitationCanBeAnswered(item, session.user.id, now) && (
        <div className={s.actions}>
          <Button
            type="button"
            disabled={busy !== null}
            onClick={() => void onAnswer(item, 'accept')}
          >
            {t.accept}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() => void onAnswer(item, 'decline')}
          >
            {t.decline}
          </Button>
        </div>
      )}
    </article>
  );
}
