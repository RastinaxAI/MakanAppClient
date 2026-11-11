'use client';
import { uiClass } from '@/components/v5/classes';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { messagingInvitations as t } from '@/content/fa';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { date, number } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import {
  invitationCanBeAnswered,
  receivedPendingInvitations,
  validInvitationReceipt,
} from './invitation-model';
import s from './received-invitations.module.css';
type Invitation = components['schemas']['ConversationInvitationResult'];
const path = '/api/v1/messaging/invitations';

export function ReceivedMessagingInvitations({ hideEmpty = false }: { hideEmpty?: boolean } = {}) {
  const { session, call } = usePersonal(),
    cache = useQueryClient(),
    router = useRouter();
  const invitations = usePersonalApi<Invitation[]>(path, { poll: 10000 });
  const lock = useRef(false);
  const [busy, setBusy] = useState<string | null>(null),
    [error, setError] = useState<unknown>(),
    [declined, setDeclined] = useState(false);
  const pending = receivedPendingInvitations(invitations.data ?? [], session.user.id);
  async function answer(item: Invitation, decision: 'accept' | 'decline') {
    if (lock.current || !invitationCanBeAnswered(item, session.user.id)) return;
    lock.current = true;
    setBusy(item.id);
    setError(undefined);
    setDeclined(false);
    try {
      const result = await call<Invitation>(`${path}/${item.id}/${decision}`, { method: 'POST' });
      if (!validInvitationReceipt(item, result, decision))
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      cache.setQueryData<Invitation[]>(
        ['personal', session.user.id, session.revision, path],
        (items) => items?.map((old) => (old.id === item.id ? result : old)),
      );
      await cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] });
      if (decision === 'accept') router.push('/personal/messages/' + result.conversationId);
      else setDeclined(true);
    } catch (problem) {
      setError(problem);
      // Refresh authoritative status; never retry an accept/decline automatically.
      void invitations.refetch();
    } finally {
      setBusy(null);
      lock.current = false;
    }
  }
  if (hideEmpty && invitations.isSuccess && !pending.length && busy === null && !declined && !error)
    return null;
  return (
    <details className={uiClass(s.panel)} data-messaging-invitations>
      <summary>
        <MailCheck size={19} aria-hidden="true" />
        <span>{t.title}</span>
        {invitations.data && <b>{number(pending.length)}</b>}
      </summary>
      <div className={uiClass(s.body)}>
        <p>{t.explanation}</p>
        {invitations.isPending ? (
          <LoadingSkeleton />
        ) : invitations.isError ? (
          <ErrorState error={invitations.error} onRetry={() => void invitations.refetch()} />
        ) : !pending.length ? (
          <EmptyState title={t.empty} />
        ) : (
          pending.map((item, index) => (
            <article key={item.id} aria-label={t.received + ' ' + number(index + 1)}>
              <h2>{t.pending}</h2>
              <p>
                {t.expires} {date(item.expiresAtUtc, true)}
              </p>
              {invitationCanBeAnswered(item, session.user.id) ? (
                <div className={uiClass(s.actions)}>
                  <Button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void answer(item, 'accept')}
                  >
                    {busy === item.id ? t.busy : t.accept}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy !== null}
                    onClick={() => void answer(item, 'decline')}
                  >
                    {t.decline}
                  </Button>
                </div>
              ) : (
                <p>{t.expired}</p>
              )}
            </article>
          ))
        )}
        {!!error && <ErrorState error={error} />}
        {declined && <p role="status">{t.declined}</p>}
        <Button
          type="button"
          variant="ghost"
          disabled={busy !== null || invitations.isFetching}
          onClick={() => void invitations.refetch()}
        >
          {t.refresh}
        </Button>
      </div>
    </details>
  );
}
