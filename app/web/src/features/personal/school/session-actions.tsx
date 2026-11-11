'use client';
import { uiClass } from '@/components/v5/classes';

import { useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as copy from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { V4CheckLine } from '@/components/v4/page';
import { SceneMenuClose } from '@/components/v5/form-actions';
import { ApiError } from '@/lib/api/errors';
import { date, number } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { base } from './shared';
type S = components['schemas'];
const t = copy.v5Sessions;
export type SessionCommand = { kind: 'cancel' | 'complete'; session: S['SessionResult'] };

export function SessionMenu({
  session,
  edit = false,
  onCommand,
}: {
  session: S['SessionResult'];
  edit?: boolean;
  onCommand: (command: SessionCommand) => void;
}) {
  const close = useContext(SceneMenuClose);
  return (
    <div className={uiClass('stack')}>
      <Button asChild variant="outline">
        <Link href={`${base}/sessions/${session.id}?view=attendance`} onClick={close ?? undefined}>
          {t.attendance}
        </Link>
      </Button>
      {!edit && session.status === 'Scheduled' && (
        <Button asChild variant="outline">
          <Link href={`${base}/sessions/${session.id}/edit`} onClick={close ?? undefined}>
            {copy.text_04f471efe1c1}
          </Link>
        </Button>
      )}
      <Button asChild variant="outline">
        <Link href={`${base}/classes/${session.classId}`} onClick={close ?? undefined}>
          {copy.text_e0d21ee48bbf}
        </Link>
      </Button>
      {session.status === 'Scheduled' &&
        (['cancel', 'complete'] as const).map((kind) => (
          <Button
            key={kind}
            type="button"
            variant={kind === 'cancel' ? 'destructive' : 'outline'}
            onClick={() => {
              close?.();
              onCommand({ kind, session });
            }}
          >
            {kind === 'cancel' ? copy.text_7a68b6ab2d41 : t.complete}
          </Button>
        ))}
    </div>
  );
}

/** The reviewed session token is frozen; reads cannot silently authorize a newer command. */
export function SessionCommandDialog({
  command,
  current,
  onClose,
  onRefresh,
  onCommitted,
}: {
  command: SessionCommand;
  current: S['SessionResult'];
  onClose: () => void;
  onRefresh: () => Promise<unknown>;
  onCommitted: (result: S['SessionResult']) => Promise<void>;
}) {
  const { call } = usePersonal();
  const [reviewedVersion, setReviewedVersion] = useState(''),
    [submitting, setSubmitting] = useState(false),
    [refreshing, setRefreshing] = useState(false),
    [conflict, setConflict] = useState(false),
    [refreshError, setRefreshError] = useState<unknown>();
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const complete = command.kind === 'complete',
    snapshot = command.session;
  const attendance = usePersonalApi<S['SessionAttendanceResult']>(
    '/api/v1/academic/sessions/' + snapshot.id + '/attendance',
    { enabled: complete },
  );
  const validAttendance =
    attendance.isSuccess &&
    attendance.data.sessionId === snapshot.id &&
    attendance.data.sessionStatus === 'Scheduled' &&
    new Set(attendance.data.entries.map((entry) => entry.enrollmentId)).size ===
      attendance.data.entries.length;
  const attendanceVersion = validAttendance ? JSON.stringify(attendance.data) : '';
  const reviewed = !!attendanceVersion && reviewedVersion === attendanceVersion;
  const stale = current.rowVersion !== snapshot.rowVersion || current.status !== 'Scheduled';
  const disabled =
    submitting ||
    refreshing ||
    stale ||
    conflict ||
    !snapshot.rowVersion.trim() ||
    (complete && (!reviewed || !validAttendance));
  return (
    <ConfirmAction
      open
      hideTrigger
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      scenario={complete ? 'MK-127' : 'MK-126'}
      title={complete ? t.complete : copy.text_0435469ff2ca}
      trigger={complete ? t.complete : copy.text_7a68b6ab2d41}
      description=""
      confirm={complete ? t.completeAction : copy.text_7a68b6ab2d41}
      destructive={!complete}
      primaryFirst
      disabled={disabled}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        requestAnimationFrame(() =>
          document
            .querySelector<HTMLButtonElement>(
              '.v5-scene .rx-head button.rx-icon-button:not(.rx-back)',
            )
            ?.focus(),
        );
      }}
      feedback={
        <>
          <dl className={uiClass('v5-dialog-summary')}>
            <div>
              <dt>{t.session}</dt>
              <dd>{snapshot.title}</dd>
            </div>
            <div>
              <dt>{complete ? t.recorded : t.time}</dt>
              <dd>
                {complete
                  ? validAttendance
                    ? t.recordedCount(
                        number(
                          attendance.data!.entries.filter((entry) => entry.status !== 'NotRecorded')
                            .length,
                        ),
                        number(attendance.data!.entries.length),
                      )
                    : '—'
                  : date(snapshot.startUtc, true)}
              </dd>
            </div>
          </dl>
          {complete && (
            <>
              {attendance.isPending && <LoadingSkeleton />}
              {attendance.isError && (
                <ErrorState error={attendance.error} onRetry={() => void attendance.refetch()} />
              )}
              {attendance.isSuccess && !validAttendance && (
                <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
              )}
              <V4CheckLine
                label={t.reviewed}
                checked={reviewed}
                required
                disabled={submitting || !validAttendance}
                onCheckedChange={(checked) => setReviewedVersion(checked ? attendanceVersion : '')}
              />
            </>
          )}
          <p className={uiClass('policy dialog-policy')}>
            {complete ? t.completePolicy : t.cancelPolicy}
          </p>
          {(stale || conflict) && (
            <>
              <p role="status">{t.changed}</p>
              <Button
                type="button"
                variant="outline"
                disabled={refreshing || submitting}
                onClick={async () => {
                  setRefreshing(true);
                  setRefreshError(undefined);
                  try {
                    await onRefresh();
                    if (alive.current) onClose();
                  } catch (error) {
                    if (alive.current) setRefreshError(error);
                  } finally {
                    if (alive.current) setRefreshing(false);
                  }
                }}
              >
                {t.latest}
              </Button>
            </>
          )}
          {!!refreshError && <ErrorState error={refreshError} />}
        </>
      }
      onConfirm={async () => {
        if (disabled) return false;
        setSubmitting(true);
        try {
          const body: S['SessionVersionCommand'] = { expectedRowVersion: snapshot.rowVersion };
          const result = await call<S['SessionResult']>(
            '/api/v1/academic/sessions/' + snapshot.id + '/' + command.kind,
            { method: 'POST', expectedStatus: 200, body: JSON.stringify(body) },
          );
          if (
            result.id !== snapshot.id ||
            result.organizationId !== snapshot.organizationId ||
            result.classId !== snapshot.classId ||
            result.status !== (complete ? 'Completed' : 'Cancelled') ||
            !result.rowVersion.trim() ||
            result.rowVersion === snapshot.rowVersion
          )
            throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
          if (!alive.current) return false;
          await onCommitted(result);
          return true;
        } catch (error) {
          if (alive.current && error instanceof ApiError && [409, 412].includes(error.status))
            setConflict(true);
          throw error;
        } finally {
          if (alive.current) setSubmitting(false);
        }
      }}
    />
  );
}
