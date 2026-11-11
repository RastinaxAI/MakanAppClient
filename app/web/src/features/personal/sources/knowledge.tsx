'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { components } from '@/generated/api/schema';
import { clientValidator } from '@/lib/api/client-contract';
import { aiIntegration as t } from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useViewState } from '@/components/hooks/use-view-state';
import { ApiError, isRecord } from '@/lib/api/errors';
import { usePersonal } from '../provider';
import { useResourceCommand } from '../use-resource-command';
import { AssistantPayer } from '../assistant/payer';
import type { AiPayer } from '../assistant/model';
type S = components['schemas'];
type Action = 'ingest' | 'reindex' | 'supersede' | 'delete';
type Pending = { action: Action; command: S['KnowledgeMutationCommand']; version: number };
const actions: Action[] = ['ingest', 'reindex', 'supersede', 'delete'];
const working = new Set([
  'Queued',
  'Extracting',
  'OCR',
  'Normalizing',
  'Chunking',
  'Embedding',
  'Indexing',
]);
export function SourceKnowledge({ source }: { source: S['EducationalSourceResult'] }) {
  const { session, call } = usePersonal(),
    command = useResourceCommand('knowledge:' + source.sourceId);
  const key = `makan:draft:knowledge:${session.user.id}:${session.revision}:${source.sourceId}`;
  const [pending, setPending, loaded] = useViewState<Pending | null>(
    key,
    null,
    (v): v is Pending | null =>
      v === null ||
      (isRecord(v) &&
        actions.includes(v.action as Action) &&
        Number.isSafeInteger(v.version) &&
        Number(v.version) > 0 &&
        clientValidator({ $ref: '#/components/schemas/KnowledgeMutationCommand' }).safeParse(
          v.command,
        ).success),
  );
  const [reason, setReason] = useViewState(
    key + ':reason',
    '',
    (v): v is string => typeof v === 'string' && v.length <= 500,
  );
  const [payer, setPayer] = useState<AiPayer | ''>('');
  const [retryAt, setRetryAt] = useState(0),
    [waiting, setWaiting] = useState(false);
  const allowed = source.capabilities.canRead && source.scope !== 'Library';
  const path = `/api/v1/sources/${source.sourceId}/versions/${source.currentVersion}/knowledge/`;
  const status = useQuery({
    queryKey: ['personal', session.user.id, session.revision, path + 'status'],
    enabled: allowed && Number.isSafeInteger(source.currentVersion) && source.currentVersion > 0,
    queryFn: async ({ signal }) => {
      const value = await call<S['KnowledgeProcessingStatus']>(path + 'status', {
        signal,
        expectedStatus: 200,
      });
      if (value.sourceId !== source.sourceId || value.version !== source.currentVersion)
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      return value;
    },
    refetchInterval: (q) =>
      q.state.status === 'success' && q.state.data && working.has(q.state.data.state)
        ? 5000
        : false,
    retry: false,
  });
  const failure = command.error ?? status.error;
  useEffect(() => {
    if (failure instanceof ApiError && failure.problem.retryAfter)
      setRetryAt(Date.now() + failure.problem.retryAfter * 1000);
  }, [failure]);
  useEffect(() => {
    const left = retryAt - Date.now();
    setWaiting(left > 0);
    if (left > 0) {
      const timer = window.setTimeout(() => setWaiting(false), left);
      return () => window.clearTimeout(timer);
    }
  }, [retryAt]);
  if (!allowed) return null;
  const writable = source.capabilities.canWrite && source.status === 'Active';
  const changed =
    !!pending &&
    (pending.command.expectedVersion !== source.version ||
      pending.version !== source.currentVersion);
  async function run(action: Action) {
    if (
      !loaded ||
      !writable ||
      changed ||
      retryAt > Date.now() ||
      (pending && pending.action !== action)
    )
      return false;
    const frozen = pending ?? {
      action,
      version: source.currentVersion,
      command: {
        clientOperationId: crypto.randomUUID(),
        expectedVersion: source.version,
        reason: reason.trim(),
        payer: payer || null,
      },
    };
    if (!frozen.command.reason) return false;
    sessionStorage.setItem(key, JSON.stringify(frozen));
    setPending(frozen);
    const result = await command.run<S['KnowledgeProcessingStatus']>(
      path + action,
      frozen.command,
      {
        acceptResult: (value) =>
          value.sourceId === source.sourceId && value.version === frozen.version,
        reconcileOnError: true,
      },
    );
    if (!result) return false;
    sessionStorage.removeItem(key);
    setPending(null);
    void status.refetch();
    return true;
  }
  return (
    <section className={uiClass('card v5-native-form')} aria-label={t.knowledge}>
      <h2>{t.knowledge}</h2>
      {status.isPending ? (
        <LoadingSkeleton />
      ) : status.isError ? (
        <ErrorState error={status.error} />
      ) : (
        <p role="status">
          {t.status}: {t.knowledgeStates[status.data.state]}
        </p>
      )}
      <Button
        variant="outline"
        disabled={command.busy || status.isFetching || waiting}
        onClick={() => void status.refetch()}
      >
        {t.refresh}
      </Button>
      {writable && (
        <>
          <label className={uiClass('field')}>
            {t.reason}
            <NativeInput
              value={pending?.command.reason ?? reason}
              disabled={command.busy || !!pending || !loaded}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <AssistantPayer
            value={pending?.command.payer ?? payer}
            onChange={setPayer}
            disabled={command.busy || !!pending}
          />
          {changed && <p role="alert">{t.reviewVersion}</p>}
          <div className={uiClass('confirm-actions')}>
            {actions.map((action) => (
              <ConfirmAction
                key={action}
                title={t[action]}
                trigger={t[action]}
                description={t.confirmLifecycle}
                destructive={action === 'delete' || action === 'supersede'}
                disabled={
                  !loaded ||
                  command.busy ||
                  waiting ||
                  changed ||
                  !(pending?.command.reason ?? reason).trim() ||
                  (!!pending && pending.action !== action) ||
                  (action === 'ingest' && (!source.fileReady || !source.sourceReady))
                }
                onConfirm={() => run(action)}
              />
            ))}
          </div>
          {pending && !command.busy && (
            <>
              <p>{t.uncertain}</p>
              <ConfirmAction
                title={t.newRequest}
                trigger={changed ? t.adoptVersion : t.newRequest}
                description={t.uncertain}
                onConfirm={async () => {
                  sessionStorage.removeItem(key);
                  setPending(null);
                  command.clearFeedback();
                  return true;
                }}
              />
            </>
          )}
        </>
      )}
      {command.feedback}
      {waiting && <p role="status">{t.wait}</p>}
    </section>
  );
}
