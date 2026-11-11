'use client';
import {
  Select as NativeSelect,
  Input as NativeInput,
  Textarea as NativeTextarea,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import appearance from './formation.module.css';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { integration80c as t } from '@/content/fa';
import { Button, buttonClass } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState, LoadingSkeleton, EmptyState } from '@/components/ui/states';
import { usePersonalApi } from '@/features/personal/provider';
import { Field, Pager } from '@/features/personal/school/shared';
import { date } from '@/lib/formatting';
import { useClassCommand } from './use-class-command';
import { ApiError } from '@/lib/api/errors';
import {
  classBase as base,
  requestApi as api,
  stateLabel,
  validRequest,
  type S,
} from './api-model';
import { StaticConnectedFrame } from './frame';
import { V4List, V4Row, V4Note } from '@/components/v4/page';
import { CheckCircle2, Clock3, AlertCircle, Users, MessagesSquare, Megaphone } from 'lucide-react';

export function FormationList() {
  const [page, setPage] = useState(1),
    [status, setStatus] = useState('');
  const q = usePersonalApi<S['PersonalClassPageOfPersonalClassRequestDto']>(
    `${api}?page=${page}&pageSize=30${status ? '&status=' + status : ''}`,
    { poll: 15000 },
  );
  return (
    <StaticConnectedFrame id="MK-12" title={t.requests}>
      <Field label={t.status}>
        <NativeSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t.all}</option>
          {[
            'Draft',
            'Submitted',
            'UnderReview',
            'NeedsChanges',
            'Approved',
            'Rejected',
            'Cancelled',
          ].map((s) => (
            <option key={s} value={s}>
              {stateLabel(s)}
            </option>
          ))}
        </NativeSelect>
      </Field>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          {!q.data.items.length && <EmptyState title={t.noRequests} />}
          {q.data.items.map((r) => (
            <Link className={uiClass('card')} key={r.id} href={`${base}/requests/${r.id}`}>
              <span className={uiClass('badge')}>{stateLabel(r.status)}</span>
              <h3>{r.details.title}</h3>
              <p>{r.details.purpose}</p>
              <small>{date(r.createdAtUtc, true)}</small>
            </Link>
          ))}
          <Pager page={page} total={q.data.totalCount} onChange={setPage} />
        </>
      )}
      <Link className={uiClass(buttonClass('btn'))} href={`${base}/requests/new`}>
        {t.requests}
      </Link>
    </StaticConnectedFrame>
  );
}
export function FormationDetail({ id, editing }: { id: string; editing?: boolean }) {
  const q = usePersonalApi<S['PersonalClassRequestDto']>(api + '/' + id, {
    poll: editing ? undefined : 5000,
  });
  const [page, setPage] = useState(1);
  const history = usePersonalApi<S['PersonalClassPageOfPersonalClassDecisionDto']>(
    `${api}/${id}/history?page=${page}&pageSize=30`,
  );
  const command = useClassCommand('request:' + id);
  const showProgress =
    !editing &&
    q.isSuccess &&
    q.data?.status === 'Approved' &&
    !!q.data.createdClassId &&
    !!q.data.progress;
  const classroom = usePersonalApi<S['PersonalClassDto']>(
    `/api/v1/personal-classes/${q.data?.createdClassId}`,
    { enabled: showProgress },
  );
  const historyView = (
    <section className={uiClass('card')}>
      <h3>{t.history}</h3>
      {history.isPending ? (
        <LoadingSkeleton />
      ) : history.isError ? (
        <ErrorState error={history.error} onRetry={() => void history.refetch()} />
      ) : (
        <>
          {!history.data.items.length && <EmptyState title={uiText.vnext.empty} />}
          {history.data.items.map((item) => (
            <div className={uiClass('row')} key={item.id}>
              <div>
                <p>{stateLabel(item.action)}</p>
                <p>{item.reason}</p>
                <small>{date(item.occurredAtUtc, true)}</small>
              </div>
            </div>
          ))}
          {(page > 1 || history.data.totalCount > history.data.pageSize) && (
            <Pager page={page} total={history.data.totalCount} onChange={setPage} />
          )}
        </>
      )}
    </section>
  );
  if (showProgress && q.data)
    return (
      <FormationProgress
        value={q.data}
        classroom={classroom.data}
        classError={
          classroom.data && classroom.data.id !== q.data.createdClassId
            ? new ApiError(502, { code: 'CONTRACT_MISMATCH' })
            : classroom.error
        }
        retryClass={() => void classroom.refetch()}
        history={historyView}
        refresh={() => void q.refetch()}
      />
    );
  return (
    <StaticConnectedFrame
      id="MK-18"
      back={base + '/requests'}
      title={q.data?.details.title ?? t.requests}
    >
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          <div className={uiClass('card')}>
            <span className={uiClass('badge')}>{stateLabel(q.data.status)}</span>
            <p>{q.data.details.purpose}</p>
            <p>{q.data.details.description}</p>
            {q.data.decisionReason && <p>{q.data.decisionReason}</p>}
            <p>
              {t.capacity}
              {uiText.text_45822f54a0d0}
              {q.data.details.suggestedCapacity.toLocaleString('fa-IR')}
            </p>
            {q.data.createdClassId && (
              <Link
                className={uiClass(buttonClass('btn secondary'))}
                href={`${base}/classes/${q.data.createdClassId}`}
              >
                {t.created}
              </Link>
            )}
            {q.data.progress && (
              <dl>
                {Object.entries(q.data.progress).map(([key, value]) => (
                  <div className={uiClass('kv')} key={key}>
                    <dt>
                      {
                        (
                          {
                            classState: t.status,
                            managerAccepted: t.managerAccepted,
                            groupState: t.group,
                            channelState: t.channel,
                          } as Record<string, string>
                        )[key]
                      }
                    </dt>
                    <dd>
                      {typeof value === 'boolean'
                        ? value
                          ? t.yes
                          : t.no
                        : stateLabel(String(value))}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {q.data.capabilities.canEdit &&
            (editing ? (
              <RequestEdit value={q.data} />
            ) : (
              <Link
                className={uiClass(buttonClass('btn secondary'))}
                href={`${base}/requests/${id}/edit`}
              >
                {t.edit}
              </Link>
            ))}
          {q.data.capabilities.canSubmit && (
            <ConfirmAction
              title={t.submit}
              trigger={t.submit}
              description={t.formationHint}
              onConfirm={async () =>
                !!(await command.run(`${api}/${id}/submit`, { expectedVersion: q.data.version }))
              }
            />
          )}
          {q.data.capabilities.canCancel && (
            <ConfirmAction
              title={t.cancel}
              trigger={t.cancel}
              description={t.formationHint}
              onConfirm={async () =>
                !!(await command.run(`${api}/${id}/cancel`, { expectedVersion: q.data.version }))
              }
            />
          )}
          <Button variant="outline" onClick={() => void q.refetch()}>
            {t.refresh}
          </Button>
          {command.feedback}
        </>
      )}
      {historyView}
    </StaticConnectedFrame>
  );
}
function FormationProgress({
  value,
  classroom,
  refresh,
  classError,
  retryClass,
  history,
}: {
  value: S['PersonalClassRequestDto'];
  classroom?: S['PersonalClassDto'];
  refresh: () => void;
  classError?: unknown;
  retryClass: () => void;
  history: ReactNode;
}) {
  const progress = value.progress!;
  const validClass = !!classroom && classroom.id === value.createdClassId;
  const ready =
    ['Active', 'Ready'].includes(progress.classState) &&
    progress.managerAccepted &&
    progress.groupState === 'Ready' &&
    progress.channelState === 'Ready';
  const failed = [progress.classState, progress.groupState, progress.channelState].some((state) =>
    ['Failed', 'Error'].includes(state),
  );
  const copy = uiText.v5Product;
  const title = ready
    ? copy.formationReady
    : failed
      ? copy.formationFailed
      : copy.formationProgress;
  const steps = [
    {
      key: 'class',
      title: copy.formationClass,
      state: progress.classState,
      done: ['Active', 'Ready'].includes(progress.classState),
    },
    {
      key: 'manager',
      title: copy.formationManager,
      state: progress.managerAccepted ? 'Accepted' : 'Pending',
      done: progress.managerAccepted,
    },
    {
      key: 'group',
      title: copy.formationGroup,
      state: progress.groupState,
      done: progress.groupState === 'Ready',
    },
    {
      key: 'channel',
      title: copy.formationChannel,
      state: progress.channelState,
      done: progress.channelState === 'Ready',
    },
  ];
  return (
    <StaticConnectedFrame
      id={ready ? 'MK-22' : failed ? 'MK-21' : 'MK-20'}
      title={title}
      subtitle={value.details.title}
      back={base + '/requests'}
      menu={history}
      actions={
        ready && validClass ? (
          <Button asChild>
            <Link href={`${base}/classes/${classroom.id}`}>{copy.openClass}</Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={base + '/requests'}>{copy.backToRequests}</Link>
          </Button>
        )
      }
    >
      <div
        className={uiClass(
          'v5-formation-status ' +
            appearance['v5-formation-status'] +
            ' ' +
            (failed ? 'formation-warning' : ''),
        )}
        data-formation-progress={ready ? 'Ready' : failed ? 'Failed' : 'Pending'}
      >
        <span className={uiClass('v5-status-symbol' + ' ' + appearance['v5-status-symbol'])}>
          {ready ? <CheckCircle2 /> : failed ? <AlertCircle /> : <Users />}
        </span>
        <h2>
          {ready
            ? copy.formationReadyDescription
            : failed
              ? copy.formationFailedDescription
              : copy.formationProgressDescription}
        </h2>
        <p>{value.details.title}</p>
      </div>
      <progress
        className={uiClass('v5-formation-bar' + ' ' + appearance['v5-formation-bar'])}
        max={steps.length}
        value={steps.filter((step) => step.done).length}
        aria-label={copy.formationProgress}
      />
      <ol className={uiClass('v5-formation-steps' + ' ' + appearance['v5-formation-steps'])}>
        {steps.map((step) => (
          <li key={step.key}>
            <span aria-hidden="true">
              {step.done ? (
                <CheckCircle2 />
              ) : ['Failed', 'Error'].includes(step.state) ? (
                <AlertCircle />
              ) : (
                <Clock3 />
              )}
            </span>
            <div>
              <strong>{step.title}</strong>
              <small>{stateLabel(step.state || 'Unknown')}</small>
            </div>
          </li>
        ))}
      </ol>
      <V4Note>{copy.formationTracking}</V4Note>
      {!!classError && <ErrorState error={classError} onRetry={retryClass} />}
      {validClass && (
        <V4List>
          <V4Row
            title={t.members}
            icon={<Users />}
            href={`${base}/classes/${classroom.id}/members`}
          />
          <V4Row
            title={t.spaces}
            icon={<MessagesSquare />}
            href={`${base}/classes/${classroom.id}/setup`}
          />
          {classroom.capabilities?.canManageSpaces && (
            <V4Row
              title={copy.trackPreparation}
              icon={<Megaphone />}
              href={`${base}/classes/${classroom.id}/setup`}
            />
          )}
        </V4List>
      )}
      <Button variant="outline" onClick={refresh}>
        {t.refresh}
      </Button>
    </StaticConnectedFrame>
  );
}
function RequestEdit({ value }: { value: S['PersonalClassRequestDto'] }) {
  const [details, setDetails] = useState(value.details),
    [version, setVersion] = useState(value.version);
  const command = useClassCommand('edit-request:' + value.id);
  const stale = version !== value.version;
  return (
    <form
      className={uiClass('card stack')}
      onSubmit={async (e) => {
        e.preventDefault();
        if (stale || !validRequest(details)) return;
        const result = await command.run<S['PersonalClassRequestDto']>(
          `${api}/${value.id}`,
          { expectedVersion: version, details },
          { method: 'PUT' },
        );
        if (result) setVersion(result.value.version);
      }}
    >
      <Field label={t.title}>
        <NativeInput
          required
          maxLength={200}
          value={details.title}
          onChange={(e) => setDetails({ ...details, title: e.target.value })}
        />
      </Field>
      <Field label={t.purpose}>
        <NativeTextarea
          required
          maxLength={2000}
          value={details.purpose}
          onChange={(e) => setDetails({ ...details, purpose: e.target.value })}
        />
      </Field>
      <Field label={t.description}>
        <NativeTextarea
          maxLength={4000}
          value={details.description ?? ''}
          onChange={(e) => setDetails({ ...details, description: e.target.value || null })}
        />
      </Field>
      <Field label={t.capacity}>
        <NativeInput
          type="number"
          required
          min={1}
          value={details.suggestedCapacity}
          onChange={(e) => setDetails({ ...details, suggestedCapacity: Number(e.target.value) })}
        />
      </Field>
      {stale && (
        <>
          <p role="alert">{t.versionConflict}</p>
          <Button type="button" variant="outline" onClick={() => setVersion(value.version)}>
            {t.refresh}
          </Button>
        </>
      )}
      <Button disabled={command.busy || stale || !validRequest(details)}>{t.save}</Button>
      {command.feedback}
    </form>
  );
}
