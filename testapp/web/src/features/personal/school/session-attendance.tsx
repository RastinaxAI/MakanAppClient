'use client';
import { Input as NativeInput, SearchField } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { v5Attendance as t, v5Sessions, text_fa7af603d430 as cancel } from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { V4Field, V4Hero, V4List, V4Row } from '@/components/v4/page';
import { useSceneContextSummary, useSceneFormAction } from '@/components/v5/form-actions';
import { useTextDraft } from '@/components/hooks/use-text-draft';
import { useViewState } from '@/components/hooks/use-view-state';
import { contextSignature } from '@/lib/client-surface';
import { ApiError } from '@/lib/api/errors';
import { number } from '@/lib/formatting';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import { base } from './shared';
import { WorkflowPage, useWorkflowDraft } from './workflow';
import {
  attendanceDraft,
  attendanceMarks,
  parseAttendanceDraft,
  sameAttendanceBase,
  validAttendance,
  validAttendanceAck,
  type Attendance,
  type AttendanceDraft,
  type AttendanceEntry,
  type RowDraft,
} from './attendance-model';
import { useAttendanceRoster } from './attendance-roster';
type S = components['schemas'];
type Overlay = { kind: 'row'; enrollmentId: string } | { kind: 'review'; rows: AttendanceDraft };
const mismatch = () => new ApiError(502, { code: 'CONTRACT_MISMATCH' });

export function SessionAttendancePage({ id }: { id: string }) {
  const [overlay, setOverlay] = useState<Overlay>();
  return (
    <WorkflowPage
      scenario="MK-128"
      title={v5Sessions.attendance}
      eyebrow=""
      back={`${base}/sessions/${id}`}
      roles={['Teacher', 'Manager']}
      overlayActive={!!overlay}
    >
      <AttendanceResource id={id} overlay={overlay} setOverlay={setOverlay} />
    </WorkflowPage>
  );
}
function AttendanceResource({
  id,
  overlay,
  setOverlay,
}: {
  id: string;
  overlay?: Overlay;
  setOverlay: (value: Overlay | undefined) => void;
}) {
  const { session } = usePersonal();
  const sessionQuery = usePersonalApi<S['SessionResult']>(`/api/v1/academic/sessions/${id}`);
  const item = sessionQuery.data;
  const bound = !!item && item.id === id && item.organizationId === session.context.organizationId;
  const q = usePersonalApi<Attendance>(`/api/v1/academic/sessions/${id}/attendance`, {
    enabled: bound,
  });
  if (sessionQuery.isPending || (bound && q.isPending)) return <LoadingSkeleton />;
  if (sessionQuery.isError)
    return <ErrorState error={sessionQuery.error} onRetry={() => void sessionQuery.refetch()} />;
  if (!bound) return <ErrorState error={new ApiError(403)} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  if (!q.data || !validAttendance(q.data, id, item.status))
    return (
      <ErrorState
        error={mismatch()}
        onRetry={() => {
          void sessionQuery.refetch();
          void q.refetch();
        }}
      />
    );
  return (
    <AttendanceEditor
      key={session.user.id + ':' + session.revision + ':' + id}
      item={item}
      attendance={q.data}
      overlay={overlay}
      setOverlay={setOverlay}
      onRefresh={async () => {
        const next = await q.refetch({ throwOnError: true });
        if (!next.data || !validAttendance(next.data, id, item.status)) throw mismatch();
        return next.data;
      }}
    />
  );
}
function AttendanceEditor({
  item,
  attendance,
  overlay,
  setOverlay,
  onRefresh,
}: {
  item: S['SessionResult'];
  attendance: Attendance;
  overlay?: Overlay;
  setOverlay: (value: Overlay | undefined) => void;
  onRefresh: () => Promise<Attendance>;
}) {
  const { session, call } = usePersonal(),
    cache = useQueryClient();
  const scope =
    session.user.id + ':' + contextSignature(session.context) + ':session-attendance:' + item.id;
  const draft = useTextDraft(scope, '{}', '1');
  const rows = useMemo(() => parseAttendanceDraft(draft.text), [draft.text]);
  const roster = useAttendanceRoster(item.classId, attendance.entries);
  const [search, setSearch] = useViewState(
    scope + ':search',
    '',
    (value): value is string => typeof value === 'string',
  );
  const [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false),
    alive = useRef(true);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const names = roster.data ?? {};
  const pending = Object.entries(rows ?? {});
  const entry = (id: string) => attendance.entries.find((row) => row.enrollmentId === id);
  const conflict = (id: string, row: RowDraft) =>
    row.uncertain || !sameAttendanceBase(entry(id), row);
  const blocked = pending.some(
    ([id, row]) =>
      conflict(id, row) ||
      !names[id] ||
      (row.base.attendanceId ? !row.reason.trim() : item.status !== 'Scheduled'),
  );
  const canSave =
    draft.ready && !!rows && pending.length > 0 && !busy && !blocked && item.status !== 'Cancelled';
  function updateRows(update: (rows: AttendanceDraft) => AttendanceDraft) {
    draft.setText((text) => {
      const previous = parseAttendanceDraft(text);
      return previous ? JSON.stringify(update(previous)) : text;
    });
    setSaved(false);
  }
  const action = useMemo(
    () => (
      <Button
        type="button"
        disabled={!canSave}
        onClick={() => {
          if (rows && canSave) setOverlay({ kind: 'review', rows: structuredClone(rows) });
        }}
      >
        {t.save}
      </Button>
    ),
    [canSave, rows, setOverlay],
  );
  useSceneFormAction(action);
  useSceneContextSummary(
    attendance.entries.slice(0, 3).map((row) => ({
      label: names[row.enrollmentId] || t.unknownName,
      value: label(rows?.[row.enrollmentId]?.status ?? row.status),
    })),
  );
  const selectedId = overlay?.kind === 'row' ? overlay.enrollmentId : undefined;
  const selected = selectedId ? entry(selectedId) : undefined;
  const selectedDraft = selectedId ? rows?.[selectedId] : undefined;
  const stale = selectedId && selectedDraft ? conflict(selectedId, selectedDraft) : false;
  const filtered = attendance.entries.filter(
    (row) => !search.trim() || names[row.enrollmentId]?.includes(search.trim()),
  );
  const close = () => setOverlay(undefined);
  async function cacheEntries(confirmed: AttendanceEntry[]) {
    const queryKey = [
      'personal',
      session.user.id,
      session.revision,
      '/api/v1/academic/sessions/' + item.id + '/attendance',
    ];
    await cache.cancelQueries({ queryKey, exact: true });
    cache.setQueryData<Attendance>(
      queryKey,
      (previous) =>
        previous && {
          ...previous,
          entries: previous.entries.map(
            (row) => confirmed.find((next) => next.enrollmentId === row.enrollmentId) ?? row,
          ),
        },
    );
  }
  async function commit(snapshot: AttendanceDraft) {
    if (lock.current || !canSave || draft.text !== JSON.stringify(snapshot)) return false;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    const remaining = { ...snapshot };
    let submitting: [string, RowDraft][] = [];
    try {
      const fresh = await onRefresh();
      if (
        Object.values(snapshot).some(
          (row) =>
            !sameAttendanceBase(
              fresh.entries.find((entry) => entry.enrollmentId === row.base.enrollmentId),
              row,
            ),
        )
      )
        throw new ApiError(409);
      const unrecorded = Object.entries(snapshot).filter(([, row]) => !row.base.attendanceId);
      if (unrecorded.length) {
        submitting = unrecorded;
        const body: S['RecordAttendanceCommand'] = {
          entries: unrecorded.map(([enrollmentId, row]) => ({ enrollmentId, status: row.status })),
        };
        const result = await call<AttendanceEntry[]>(
          `/api/v1/academic/sessions/${item.id}/attendance`,
          { method: 'PUT', expectedStatus: 200, body: JSON.stringify(body) },
        );
        if (
          result.length !== unrecorded.length ||
          new Set(result.map((row) => row.enrollmentId)).size !== result.length ||
          new Set(result.map((row) => row.attendanceId)).size !== result.length ||
          unrecorded.some(
            ([id, row]) =>
              !result.some((ack) => ack.enrollmentId === id && validAttendanceAck(ack, row)),
          )
        )
          throw mismatch();
        if (!alive.current) return false;
        await cacheEntries(result);
        for (const [id] of unrecorded) delete remaining[id];
        draft.setText(JSON.stringify(remaining));
        submitting = [];
      }
      for (const [id, row] of Object.entries(snapshot).filter(
        ([, row]) => !!row.base.attendanceId,
      )) {
        submitting = [[id, row]];
        const body: S['CorrectAttendanceCommand'] = {
          status: row.status,
          correctionReason: row.reason.trim(),
          expectedRowVersion: row.base.rowVersion!,
        };
        const result = await call<AttendanceEntry>(
          `/api/v1/academic/sessions/${item.id}/attendance/${row.base.attendanceId}`,
          { method: 'PATCH', expectedStatus: 200, body: JSON.stringify(body) },
        );
        if (!validAttendanceAck(result, row)) throw mismatch();
        if (!alive.current) return false;
        await cacheEntries([result]);
        delete remaining[id];
        draft.setText(JSON.stringify(remaining));
        submitting = [];
      }
      if (alive.current) {
        draft.reset();
        setSaved(true);
      }
      return true;
    } catch (problem) {
      if (alive.current) {
        for (const [id, row] of submitting) remaining[id] = { ...row, uncertain: true };
        draft.setText(JSON.stringify(remaining));
        setError(problem);
      }
      return false;
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <>
      <V4Hero title={item.title}>
        {t.sessionContext(
          new Intl.DateTimeFormat('fa-IR', {
            timeZone: 'Asia/Tehran',
            day: 'numeric',
            month: 'long',
          }).format(new Date(item.startUtc)),
          item.classTitle,
        )}
      </V4Hero>
      <SearchField
        type="search"
        aria-label={t.search}
        placeholder={t.search}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onClear={() => setSearch('')}
        disabled={busy}
      />
      {roster.isPending && <LoadingSkeleton />}
      {roster.isError && <ErrorState error={roster.error} onRetry={() => void roster.refetch()} />}
      {roster.isSuccess && attendance.entries.some((row) => !names[row.enrollmentId]) && (
        <p className={uiClass('policy')}>{t.namesUnavailable}</p>
      )}
      {draft.ready && !rows && (
        <>
          <ErrorState error={mismatch()} />
          <Button onClick={() => draft.reset()}>{t.discardInvalid}</Button>
        </>
      )}
      {filtered.length ? (
        <V4List>
          {filtered.map((row) => {
            const change = rows?.[row.enrollmentId],
              name = names[row.enrollmentId] || t.unknownName;
            return (
              <V4Row
                key={row.enrollmentId}
                title={name}
                testId={'attendance-' + row.enrollmentId}
                ariaLabel={t.rowLabel(name)}
                description={
                  change
                    ? change.base.status === change.status
                      ? t.pendingReason(label(change.status))
                      : t.pendingStatus(label(change.base.status), label(change.status))
                    : t.rowHint
                }
                icon={names[row.enrollmentId] ? [...name][0] : '—'}
                iconClassName="avatar"
                end={
                  <span
                    className={uiClass(
                      'badge' +
                        (['Absent', 'Late'].includes(change?.status ?? row.status) ? ' warn' : ''),
                    )}
                  >
                    {label(change?.status ?? row.status)}
                  </span>
                }
                endInteractive={false}
                disabled={
                  busy ||
                  !draft.ready ||
                  !rows ||
                  !names[row.enrollmentId] ||
                  item.status === 'Cancelled' ||
                  (!row.attendanceId && item.status !== 'Scheduled')
                }
                onClick={() => {
                  returnFocus.current =
                    document.activeElement instanceof HTMLButtonElement
                      ? document.activeElement
                      : null;
                  setOverlay({ kind: 'row', enrollmentId: row.enrollmentId });
                }}
              />
            );
          })}
        </V4List>
      ) : (
        <EmptyState title={search.trim() ? t.noMatch : t.empty} />
      )}
      {pending.some(([id]) => !entry(id)) && (
        <V4List>
          {pending
            .filter(([id]) => !entry(id))
            .map(([id], index) => (
              <V4Row
                key={id}
                title={t.missingRow(number(index + 1))}
                description={t.memberUnavailable}
                onClick={() => {
                  returnFocus.current =
                    document.activeElement instanceof HTMLButtonElement
                      ? document.activeElement
                      : null;
                  setOverlay({ kind: 'row', enrollmentId: id });
                }}
              />
            ))}
        </V4List>
      )}
      <p className={uiClass('policy')}>{t.policy}</p>
      {pending.length > 0 && (
        <p className={uiClass('alert')} role="status">
          {t.pendingCount(number(pending.length))}
        </p>
      )}
      {pending.some(([, row]) => row.uncertain) && <p role="status">{t.uncertain}</p>}
      {saved && <p role="status">{t.saved}</p>}
      {!!error && <ErrorState error={error} />}
      {overlay?.kind === 'row' &&
        selectedId &&
        (selected || selectedDraft) &&
        (stale ? (
          <AttendanceConflict
            key={'conflict:' + selectedId}
            name={names[selectedId] || t.unknownName}
            draft={selectedDraft!}
            current={selected}
            onRefresh={onRefresh}
            onClose={close}
            onReviewed={(latest) => {
              setError(undefined);
              updateRows((previous) => {
                const next = { ...previous },
                  local = next[selectedId];
                if (
                  local &&
                  latest &&
                  latest.learnerOrganizationPersonId === local.base.learnerOrganizationPersonId &&
                  latest.status !== local.status
                )
                  next[selectedId] = attendanceDraft(latest, local.status, local.reason);
                else delete next[selectedId];
                return next;
              });
              close();
            }}
            onReturnFocus={() => returnFocus.current?.focus()}
          />
        ) : (
          selected && (
            <AttendanceRowDialog
              key={selectedId}
              sessionId={item.id}
              name={names[selectedId] || t.unknownName}
              entry={selected}
              draft={selectedDraft}
              onClose={close}
              onReturnFocus={() => returnFocus.current?.focus()}
              onStage={(nextDraft, conflict) => {
                updateRows((previous) => {
                  const next = { ...previous };
                  if (
                    sameAttendanceBase(selected, nextDraft) &&
                    nextDraft.status === selected.status &&
                    !nextDraft.reason.trim()
                  )
                    delete next[selectedId];
                  else next[selectedId] = nextDraft;
                  return next;
                });
                if (!conflict) close();
              }}
            />
          )
        ))}
      {overlay?.kind === 'review' && (
        <ConfirmAction
          open
          hideTrigger
          title={t.review}
          trigger={t.save}
          description={t.reviewHint}
          confirm={t.save}
          primaryFirst
          disabled={busy || !canSave || draft.text !== JSON.stringify(overlay.rows)}
          onOpenChange={(open) => {
            if (!open) close();
          }}
          feedback={
            <>
              <V4List>
                {Object.entries(overlay.rows).map(([id, row]) => (
                  <V4Row
                    key={id}
                    title={names[id] || t.unknownName}
                    description={
                      <>
                        {row.base.status === row.status
                          ? t.pendingReason(label(row.status))
                          : t.pendingStatus(label(row.base.status), label(row.status))}
                        {row.base.attendanceId && (
                          <>
                            <br />
                            {t.reason}: {row.reason}
                          </>
                        )}
                      </>
                    }
                  />
                ))}
              </V4List>
              {!!error && <ErrorState error={error} />}
              {(draft.text !== JSON.stringify(overlay.rows) ||
                Object.entries(overlay.rows).some(([id, row]) => conflict(id, row))) && (
                <p role="status">{t.reviewChanged}</p>
              )}
            </>
          }
          onConfirm={() => commit(overlay.rows)}
        />
      )}
    </>
  );
}

function AttendanceRowDialog({
  sessionId,
  name,
  entry,
  draft,
  onClose,
  onStage,
  onReturnFocus,
}: {
  sessionId: string;
  name: string;
  entry: AttendanceEntry;
  draft?: RowDraft;
  onClose: () => void;
  onStage: (draft: RowDraft, conflict?: boolean) => void;
  onReturnFocus: () => void;
}) {
  const originalBase = attendanceDraft(entry, 'Present', '').base;
  const d = useWorkflowDraft(
    'attendance-row:' + sessionId + ':' + entry.enrollmentId,
    {
      status: draft?.status ?? (entry.status === 'NotRecorded' ? '' : entry.status),
      reason: draft?.reason ?? '',
    },
    JSON.stringify(originalBase),
  );
  let base: RowDraft['base'] | undefined;
  try {
    base = parseAttendanceDraft(
      JSON.stringify({
        [entry.enrollmentId]: { base: JSON.parse(d.baseVersion), status: 'Present', reason: '' },
      }),
    )?.[entry.enrollmentId]?.base;
  } catch {
    /* An invalid saved draft needs an explicit reset. */
  }
  const status = attendanceMarks.find((mark) => mark === d.values.status);
  // The reference offers three ordinary choices; retain a returned/saved Excused value.
  const offered = attendanceMarks.filter(
    (mark) => mark !== 'Excused' || entry.status === 'Excused' || status === 'Excused',
  );
  const recorded = !!base?.attendanceId;
  const valid = d.ready && !!base && !!status && (!recorded || !!d.values.reason.trim());
  function stage(conflict = false) {
    if (!valid || !base || !status) return;
    onStage({ base, status, reason: d.values.reason }, conflict);
    d.reset();
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        scenario="MK-129"
        title={recorded ? t.correctTitle(name) : t.chooseTitle(name)}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(onReturnFocus);
        }}
      >
        <form
          className={uiClass('stack')}
          onSubmit={(event) => {
            event.preventDefault();
            if (!d.stale) stage();
          }}
        >
          <fieldset className={uiClass('v5-choice-list')} aria-label={t.status} disabled={!d.ready}>
            {offered.map((mark) => (
              <label key={mark}>
                <NativeInput
                  type="radio"
                  name="attendance-status"
                  value={mark}
                  checked={status === mark}
                  onChange={() => d.set('status', mark)}
                  required
                />
                <span className={uiClass('grow')}>
                  <strong>{label(mark)}</strong>
                  <small>{t.statusHints[mark]}</small>
                </span>
              </label>
            ))}
          </fieldset>
          {recorded && (
            <V4Field label={t.reason}>
              <NativeInput
                value={d.values.reason}
                onChange={(event) => d.set('reason', event.target.value)}
                required
              />
            </V4Field>
          )}
          {(!base || d.stale) && <p role="status">{t.conflictHint}</p>}
          <div className={uiClass('confirm-actions')}>
            {d.stale ? (
              <Button type="button" disabled={!valid} onClick={() => stage(true)}>
                {t.latest}
              </Button>
            ) : (
              <Button type="submit" disabled={!valid}>
                {recorded ? t.stageCorrection : t.stage}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              {cancel}
            </Button>
          </div>
          {!base && (
            <Button type="button" onClick={d.acceptServerValues}>
              {t.discardInvalid}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
function AttendanceConflict({
  name,
  draft,
  current,
  onRefresh,
  onClose,
  onReviewed,
  onReturnFocus,
}: {
  name: string;
  draft: RowDraft;
  current?: AttendanceEntry;
  onRefresh: () => Promise<Attendance>;
  onClose: () => void;
  onReviewed: (latest: AttendanceEntry | undefined) => void;
  onReturnFocus: () => void;
}) {
  const [latest, setLatest] = useState<AttendanceEntry>(),
    [read, setRead] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!busy && !open) onClose();
      }}
    >
      <DialogContent
        scenario="RX-010"
        title={t.conflict}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(onReturnFocus);
        }}
      >
        <dl className={uiClass('v5-dialog-summary')}>
          <div>
            <dt>{t.member}</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt>{t.yourChoice}</dt>
            <dd>{label(draft.status)}</dd>
          </div>
          <div>
            <dt>{t.latestStatus}</dt>
            <dd>{(read ? latest : current) ? label((read ? latest : current)!.status) : '—'}</dd>
          </div>
        </dl>
        <p className={uiClass('policy')}>{draft.uncertain ? t.uncertain : t.conflictHint}</p>
        {read &&
          (!latest ||
            latest.learnerOrganizationPersonId !== draft.base.learnerOrganizationPersonId) && (
            <p role="status">{t.memberUnavailable}</p>
          )}
        {read && latest?.status === draft.status && <p role="status">{t.alreadyCurrent}</p>}
        {!!error && <ErrorState error={error} />}
        <div className={uiClass('confirm-actions')}>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(undefined);
              try {
                const result = await onRefresh();
                if (alive.current) {
                  setLatest(
                    result.entries.find((row) => row.enrollmentId === draft.base.enrollmentId),
                  );
                  setRead(true);
                }
              } catch (problem) {
                if (alive.current) setError(problem);
              } finally {
                if (alive.current) setBusy(false);
              }
            }}
          >
            {t.latest}
          </Button>
          {read && (
            <Button disabled={busy} onClick={() => onReviewed(latest)}>
              {latest &&
              latest.learnerOrganizationPersonId === draft.base.learnerOrganizationPersonId &&
              latest.status !== draft.status
                ? t.acceptLatest
                : t.discardThis}
            </Button>
          )}
          <Button variant="outline" disabled={busy} onClick={onClose}>
            {cancel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
