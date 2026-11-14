'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, BellOff, ChevronLeft, type LucideIcon } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { visiblePresence, visiblePresenceDetail } from './model';
import { date } from '@/lib/formatting';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ErrorState } from '@/components/ui/states';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import { usePersonal } from '../provider';
import c from './conversation-pages.module.css';
import t from './messaging-theme.module.css';
type S = components['schemas'];
export function SettingRow({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: LucideIcon;
  title: string;
  value?: string;
  href: string;
}) {
  return (
    <Link href={href} className={uiClass(c.settingRow)}>
      <Icon size={22} />
      <span>{title}</span>
      {value && <small>{value}</small>}
      <ChevronLeft size={17} />
    </Link>
  );
}
export function UnavailableSetting({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={uiClass(c.settingRow)}>
          <Icon size={22} />
          <span>{title}</span>
          <small>{uiText.text_4e67bd8e3482}</small>
          <ChevronLeft size={17} />
        </button>
      </DialogTrigger>
      <DialogContent className={uiClass(`${t.theme}`)} title={title} description={description}>
        <p className={uiClass(c.note)}>{uiText.text_fadd8b25529b}</p>
      </DialogContent>
    </Dialog>
  );
}
export function MuteAction({
  summary,
  pickerOnly = false,
  onClose,
}: {
  summary: S['ConversationSummaryResult'];
  pickerOnly?: boolean;
  onClose?: () => void;
}) {
  const { session, call } = usePersonal(),
    cache = useQueryClient();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false);
  const [open, setOpen] = useState(pickerOnly);
  async function apply(minutes: number | null) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    try {
      const until = minutes === null ? null : new Date(Date.now() + minutes * 60000).toISOString();
      const result = await call<S['ConversationUserStateResult']>(
        `/api/v1/conversations/${summary.conversationId}/mute`,
        {
          method: summary.isMuted ? 'DELETE' : 'PUT',
          scope: summary.scope === 'Personal' ? 'account' : 'context',
          ...(!summary.isMuted
            ? {
                body: JSON.stringify({
                  mode: minutes === null ? 'Permanent' : 'Until',
                  mutedUntilUtc: until,
                }),
              }
            : {}),
        },
      );
      if (
        result.conversationId !== summary.conversationId ||
        result.isMuted === summary.isMuted ||
        (!summary.isMuted &&
          (result.muteMode !== (minutes === null ? 'Permanent' : 'Until') ||
            (until !== null &&
              Math.abs(Date.parse(result.mutedUntilUtc ?? '') - Date.parse(until)) > 1000) ||
            (until !== null && !Number.isFinite(Date.parse(result.mutedUntilUtc ?? '')))))
      )
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      const key = [
        'personal',
        session.user.id,
        'account',
        'conversation-summary',
        summary.conversationId,
      ];
      await cache.cancelQueries({ queryKey: key });
      cache.setQueryData<S['ConversationSummaryResult']>(key, (old) =>
        old
          ? {
              ...old,
              isMuted: result.isMuted,
              muteMode: result.muteMode,
              mutedUntilUtc: result.mutedUntilUtc,
            }
          : old,
      );
      await Promise.all([
        cache.invalidateQueries({ queryKey: ['personal', session.user.id, 'account'] }),
        cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] }),
      ]);
      setOpen(false);
      onClose?.();
    } catch (cause) {
      setError(cause);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div>
      {!pickerOnly && (
        <button
          disabled={busy}
          className={uiClass(c.quickButton)}
          onClick={() => (summary.isMuted ? void apply(null) : setOpen(true))}
        >
          {summary.isMuted ? <BellOff size={23} /> : <Bell size={23} />}
          <span>
            {busy
              ? uiText.text_b5ef00b1806f
              : summary.isMuted
                ? uiText.text_db8eb8579dae
                : uiText.text_16be3d3db4fc}
          </span>
        </button>
      )}
      {!!error && !open && <ErrorState error={error} />}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) {
            setOpen(value);
            if (!value) onClose?.();
          }
        }}
      >
        <DialogContent className={t.selectionSheet} title={uiText.messengerPdf.muteTitle}>
          <div className={t.durationList}>
            {(
              [
                [15, uiText.messengerPdf.mute15],
                [60, uiText.messengerPdf.mute60],
                [180, uiText.messengerPdf.mute180],
                [480, uiText.messengerPdf.mute480],
                [1440, uiText.messengerPdf.mute1440],
                [null, uiText.messengerPdf.mutePermanent],
              ] as const
            ).map(([minutes, label]) => (
              <button key={String(minutes)} disabled={busy} onClick={() => void apply(minutes)}>
                {label}
              </button>
            ))}
          </div>
          {!!error && <ErrorState error={error} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Read presence only for an avatar in view. No presence is inferred from message receipts. */
export function PresenceIndicator({
  userId,
  variant = 'marker',
}: {
  userId: string;
  variant?: 'marker' | 'label';
}) {
  const { session, call } = usePersonal();
  const marker = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [clock, setClock] = useState(Date.now);
  useEffect(() => {
    if (!marker.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(marker.current);
    return () => observer.disconnect();
  }, []);
  const query = useQuery({
    queryKey: ['personal', session.user.id, 'account', 'presence', userId],
    queryFn: ({ signal }) =>
      call<S['PresenceResult']>(`/api/v1/people/${userId}/presence`, { signal, scope: 'account' }),
    enabled: visible,
    staleTime: 15000,
    refetchInterval: 30000,
    retry: false,
  });
  useEffect(() => {
    const expires = Date.parse(query.data?.expiresAtUtc ?? '');
    if (!Number.isFinite(expires) || expires <= Date.now()) return;
    const timer = setTimeout(
      () => setClock(Date.now()),
      Math.min(2147483647, expires - Date.now() + 1),
    );
    return () => clearTimeout(timer);
  }, [query.data]);
  const state = query.isError
    ? null
    : visiblePresence(query.data, userId, Math.max(clock, Date.now()));
  const detail = query.isError
    ? null
    : visiblePresenceDetail(query.data, userId, Math.max(clock, Date.now()));
  const lastSeen =
    detail?.lastSeenAtUtc &&
    Number.isFinite(Date.parse(detail.lastSeenAtUtc)) &&
    Date.parse(detail.lastSeenAtUtc) <= Date.now()
      ? detail.lastSeenAtUtc
      : null;
  const label =
    detail?.state === 'Online'
      ? uiText.messengerPdf.online
      : lastSeen
        ? uiText.messagingWorkflow.lastSeen + date(lastSeen, true)
        : detail?.state === 'Recently'
          ? uiText.messengerPdf.recently
          : detail?.state === 'Offline'
            ? uiText.messagingWorkflow.offline
            : '';
  const shown = variant === 'label' ? detail?.state : state;
  return (
    <span
      ref={marker}
      className={variant === 'label' ? t.presenceLabel : t.presence}
      data-presence-state={shown ?? ''}
      role={shown ? (variant === 'label' ? 'status' : 'img') : undefined}
      aria-hidden={!shown}
      title={variant === 'label' ? label : undefined}
      aria-label={
        variant === 'label'
          ? label
          : state === 'Online'
            ? uiText.messengerPdf.online
            : state === 'Recently'
              ? uiText.messengerPdf.recently
              : undefined
      }
    >
      {variant === 'label' ? (
        lastSeen && detail?.state !== 'Online' ? (
          <time dateTime={lastSeen}>{label}</time>
        ) : (
          label
        )
      ) : (
        state === 'Recently' && (
          <>
            <i />
            <i />
            <i />
          </>
        )
      )}
    </span>
  );
}
