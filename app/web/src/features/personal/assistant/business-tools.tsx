'use client';
import {
  Select as NativeSelect,
  Textarea as NativeTextarea,
  Input as NativeInput,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ViewTabs } from '@/components/ui/tabs';
import type { components } from '@/generated/api/schema';
import { aiIntegration as t } from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useViewState } from '@/components/hooks/use-view-state';
import { usePersonal, usePersonalApi } from '../provider';
import { useAuthorizedChildren } from '../school/use-authorized-children';
import { ChildSelector } from '../school/child-selector';
import { ApiError } from '@/lib/api/errors';
import { AssistantResult } from './result';
import { useAssistantRequest } from './use-assistant-request';
import { businessOperations, type AiPayer, type BusinessOperation } from './model';
import { checkAssistantQuota } from './preflight';
type S = components['schemas'];
type Fields = {
  question: string;
  goals: string;
  minutes: string;
  notes: string;
  objective: string;
  materials: string;
};
const empty: Fields = {
  question: '',
  goals: '',
  minutes: '',
  notes: '',
  objective: '',
  materials: '',
};
export type AssistantToolStatus = { busy: boolean; pendingPayer: AiPayer | null };
type ToolProps = {
  payer: AiPayer | '';
  disabled?: boolean;
  onStatus: (status: AssistantToolStatus) => void;
};
export function AssistantBusinessTools({
  payer,
  disabled = false,
  onStatus,
  navigationClassName,
}: ToolProps & { navigationClassName: string }) {
  const { session } = usePersonal();
  const operations = (Object.keys(businessOperations) as BusinessOperation[]).filter(
    (key) =>
      key !== 'chat' &&
      session.context.workspaceType === 'Organization' &&
      businessOperations[key].role === session.context.activeRole,
  );
  const [kind, setKind] = useState<BusinessOperation>(operations[0] ?? 'chat');
  const [status, setStatus] = useState<AssistantToolStatus>({ busy: false, pendingPayer: null });
  const choices = ['chat' as const, ...operations];
  const currentKind = choices.includes(kind) ? kind : choices[0];
  useEffect(() => onStatus(status), [onStatus, status]);
  const props = { payer, disabled, onStatus: setStatus };
  return (
    <div className={uiClass('v5-native-form')}>
      <ViewTabs
        value={currentKind}
        onChange={setKind}
        items={choices.map((value) => ({
          value,
          label: t.operations[value],
          icon: <Sparkles size={22} aria-hidden="true" />,
        }))}
        label={t.tools}
        prefix="assistant-tool"
        className={navigationClassName}
        disabled={disabled || status.busy || !!status.pendingPayer}
      />
      <section
        role="tabpanel"
        id={'assistant-tool-panel-' + currentKind}
        aria-labelledby={'assistant-tool-tab-' + currentKind}
      >
        {currentKind === 'child' ? (
          <ParentTool
            key={session.revision}
            {...props}
            selectionDisabled={status.busy || !!status.pendingPayer}
          />
        ) : (
          <BusinessForm key={currentKind} kind={currentKind} {...props} />
        )}
      </section>
    </div>
  );
}
function ParentTool({ selectionDisabled, ...props }: ToolProps & { selectionDisabled: boolean }) {
  const child = useAuthorizedChildren();
  return (
    <>
      <ChildSelector
        children={child.scoped}
        active={child.active}
        pendingId={child.pendingId}
        busy={child.busy || selectionDisabled || !!props.disabled}
        loading={child.children.isPending}
        error={child.error}
        onRetry={child.retry}
        onSelect={(id) => void child.select(id)}
      />
      <BusinessForm
        key={child.active?.learnerOrganizationPersonId ?? 'none'}
        kind="child"
        childReady={!!child.active && !child.busy && !child.children.isError}
        {...props}
      />
    </>
  );
}
function BusinessForm({
  kind,
  childReady = false,
  payer: chosenPayer,
  disabled = false,
  onStatus,
}: {
  kind: BusinessOperation;
  childReady?: boolean;
} & ToolProps) {
  const { session, call } = usePersonal(),
    request = useAssistantRequest('tool:' + kind);
  const [values, setValues, loaded] = useViewState<Fields>(
    `makan:draft:ai-fields:${session.user.id}:${session.revision}:${kind}`,
    empty,
    (v): v is Fields =>
      !!v &&
      typeof v === 'object' &&
      Object.keys(empty).every((key) => typeof (v as Fields)[key as keyof Fields] === 'string'),
  );
  const memory = `makan:draft:ai-selection:${session.user.id}:${session.revision}:${kind}:`;
  const payer = request.pending?.payer ?? chosenPayer;
  const [classId, setClass] = useViewState(
    memory + 'class',
    '',
    (v): v is string => typeof v === 'string',
  );
  const [resourceId, setResource] = useViewState(
    memory + 'resource',
    '',
    (v): v is string => typeof v === 'string',
  );
  const needsClass = ['teacherClass', 'activities', 'managerClass', 'homework'].includes(kind);
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes', {
    enabled: needsClass,
  });
  const scopedClasses =
    classes.data?.filter((c) => c.organizationId === session.context.organizationId) ?? [];
  const classroom = scopedClasses.find((c) => c.id === classId);
  const assignments = usePersonalApi<S['AssignmentResult'][]>(
    `/api/v1/academic/classes/${classId}/assignments`,
    { enabled: kind === 'homework' && !!classroom },
  );
  const exams = usePersonalApi<S['StudentExamSummary'][]>('/api/v1/academic/exams', {
    enabled: kind === 'exam',
  });
  const resources =
    kind === 'homework'
      ? assignments.data?.filter(
          (a) =>
            a.classId === classId &&
            a.organizationId === session.context.organizationId &&
            a.status === 'Published',
        )
      : exams.data?.filter((e) => e.classRef?.kind !== 'PersonalClass');
  const blocked = request.busy || !!request.pending;
  const pendingPayer = request.pending?.payer ?? null;
  useEffect(() => {
    onStatus({ busy: request.busy, pendingPayer });
  }, [onStatus, request.busy, pendingPayer]);
  const set = (key: keyof Fields, value: string) => setValues((old) => ({ ...old, [key]: value }));
  const lines = (value: string) =>
    value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  async function submit() {
    await request.run(async (signal) => {
      if (!payer) throw new ApiError(400, { code: 'AI_PAYER_SELECTION_REQUIRED' });
      if (
        (needsClass && !classroom) ||
        (['homework', 'exam'].includes(kind) && !resources?.some((r) => r.id === resourceId))
      )
        throw new ApiError(400, { code: 'AI_RESOURCE_SELECTION_REQUIRED' });
      if (kind === 'child' && !childReady)
        throw new ApiError(400, { code: 'AI_CHILD_SELECTION_REQUIRED' });
      if (
        (['chat', 'homework'].includes(kind) && !values.question.trim()) ||
        (kind === 'plan' && !lines(values.goals).length) ||
        (kind === 'activities' && !values.objective.trim())
      )
        throw new ApiError(400);
      const minutes = values.minutes.trim() ? Number(values.minutes) : null;
      if (minutes !== null && (!Number.isSafeInteger(minutes) || minutes < 1))
        throw new ApiError(400);
      await checkAssistantQuota(call, session, payer, signal);
      const operationId = crypto.randomUUID();
      const path = businessOperations[kind].path
        .replace('{classId}', classId)
        .replace('{assignmentId}', resourceId)
        .replace('{examId}', resourceId);
      const body =
        kind === 'chat'
          ? { message: values.question.trim(), conversationId: null, operationId }
          : kind === 'plan'
            ? {
                goals: lines(values.goals),
                availableMinutes: minutes,
                notes: values.notes.trim() || null,
                operationId,
              }
            : kind === 'homework'
              ? { question: values.question.trim(), operationId }
              : kind === 'activities'
                ? {
                    objective: values.objective.trim(),
                    availableMinutes: minutes,
                    materials: lines(values.materials),
                    notes: values.notes.trim() || null,
                    operationId,
                  }
                : undefined;
      return { path, operationId, payer, body };
    });
  }
  const query = kind === 'exam' ? exams : kind === 'homework' ? assignments : undefined;
  return (
    <form
      className={uiClass('v5-native-form')}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <fieldset
        className={uiClass('v5-native-fields')}
        data-fields-layout="dialog"
        disabled={disabled || blocked || !loaded || (kind === 'child' && !childReady)}
      >
        {needsClass && (
          <>
            {classes.isPending ? (
              <LoadingSkeleton />
            ) : classes.isError ? (
              <ErrorState error={classes.error} onRetry={() => void classes.refetch()} />
            ) : (
              <label className={uiClass('field')}>
                {t.class}
                <NativeSelect
                  value={classId}
                  onChange={(e) => {
                    setClass(e.target.value);
                    setResource('');
                  }}
                >
                  <option value="">{t.chooseClass}</option>
                  {scopedClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            )}
          </>
        )}
        {['homework', 'exam'].includes(kind) && (
          <>
            {query?.isError ? (
              <ErrorState error={query.error} onRetry={() => void query.refetch()} />
            ) : (
              <label className={uiClass('field')}>
                {kind === 'exam' ? t.exam : t.assignment}
                <NativeSelect
                  value={resourceId}
                  disabled={query?.isFetching || (kind === 'homework' && !classroom)}
                  onChange={(e) => setResource(e.target.value)}
                >
                  <option value="">{kind === 'exam' ? t.chooseExam : t.chooseAssignment}</option>
                  {resources?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            )}
          </>
        )}
        {['chat', 'homework'].includes(kind) && (
          <label className={uiClass('field')}>
            {t.question}
            <NativeTextarea
              required
              aria-label={t.question}
              value={values.question}
              maxLength={20000}
              onChange={(e) => set('question', e.target.value)}
            />
          </label>
        )}
        {kind === 'plan' && (
          <label className={uiClass('field')}>
            {t.goals}
            <NativeTextarea
              required
              aria-label={t.goals}
              value={values.goals}
              maxLength={20000}
              onChange={(e) => set('goals', e.target.value)}
            />
          </label>
        )}
        {kind === 'activities' && (
          <>
            <label className={uiClass('field')}>
              {t.objective}
              <NativeTextarea
                required
                aria-label={t.objective}
                value={values.objective}
                maxLength={20000}
                onChange={(e) => set('objective', e.target.value)}
              />
            </label>
            <label className={uiClass('field')}>
              {t.materials}
              <NativeTextarea
                aria-label={t.materials}
                value={values.materials}
                maxLength={20000}
                onChange={(e) => set('materials', e.target.value)}
              />
            </label>
          </>
        )}
        {['plan', 'activities'].includes(kind) && (
          <>
            <label className={uiClass('field')}>
              {t.minutes}
              <NativeInput
                type="number"
                min="1"
                step="1"
                aria-label={t.minutes}
                value={values.minutes}
                onChange={(e) => set('minutes', e.target.value)}
              />
            </label>
            <label className={uiClass('field')}>
              {t.notes}
              <NativeTextarea
                aria-label={t.notes}
                value={values.notes}
                maxLength={20000}
                onChange={(e) => set('notes', e.target.value)}
              />
            </label>
          </>
        )}
      </fieldset>
      <Button
        type="submit"
        disabled={
          disabled ||
          request.busy ||
          request.waiting ||
          !request.restored ||
          !loaded ||
          (kind === 'child' && !childReady)
        }
        aria-busy={request.busy}
      >
        {request.busy ? t.sending : request.pending ? t.retry : t.send}
      </Button>
      {request.pending && !request.busy && (
        <>
          <p role="status">{t.uncertain}</p>
          <ConfirmAction
            title={t.newRequest}
            trigger={t.newRequest}
            description={t.uncertain}
            onConfirm={async () => {
              request.reset();
              return true;
            }}
          />
        </>
      )}
      {request.waiting && <p role="status">{t.wait}</p>}
      {!!request.error && <ErrorState error={request.error} />}
      {request.result && <AssistantResult value={request.result} />}
    </form>
  );
}
