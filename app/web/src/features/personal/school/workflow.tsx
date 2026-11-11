'use client';
import { uiClass } from '@/components/v5/classes';

import { useAcademicScope } from './academic-scope';
import * as uiText from '@/content/fa';
import { useTextDraft } from '@/components/hooks/use-text-draft';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { ApiError } from '@/lib/api/errors';
import { contextSignature } from '@/lib/client-surface';
import { ClipboardCheck } from 'lucide-react';
import { V5Scene } from '@/components/v5/scene';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import r from './assessment.module.css';
import s from './school.module.css';

const WorkflowContext = createContext({ title: '', back: '', id: 'MK-92', subtitle: '' });
function workflowScene(path: string, personal: boolean) {
  if (/\/exams\/[^/]+\/questions\/new$/.test(path)) return personal ? 'MK-70' : 'MK-152';
  if (/\/exams\/new$/.test(path)) return personal ? 'MK-69' : 'MK-150';
  if (/\/exams\/[^/]+\/grading$/.test(path)) return personal ? 'MK-78' : 'MK-158';
  if (/\/exams\/[^/]+\/review$/.test(path)) return personal ? 'MK-72' : 'MK-154';
  if (/\/exam-submissions\/[^/]+/.test(path)) return personal ? 'MK-79' : 'MK-159';
  if (/\/submissions\/[^/]+/.test(path)) return personal ? 'MK-65' : 'MK-147';
  if (/\/evaluations$/.test(path)) return personal ? 'MK-64' : 'MK-146';
  if (/\/assignments\/[^/]+\/(history|receipt)$/.test(path))
    return path.endsWith('/receipt') ? 'MK-145' : 'MK-144';
  if (/\/assignments\/new$/.test(path)) return personal ? 'MK-60' : 'MK-141';
  if (/\/assignments\/[^/]+\/(edit|publish-review)$/.test(path))
    return personal ? 'MK-60' : 'MK-141';
  if (/\/sessions\/new$/.test(path)) return 'MK-122';
  if (/\/sessions\/[^/]+\/edit$/.test(path)) return 'MK-125';
  if (/\/sessions\/[^/]+$/.test(path)) return 'MK-124';
  if (/\/schedule-rules\/new$/.test(path)) return 'MK-131';
  if (/\/classes\/[^/]+\/teachers\/new$/.test(path)) return 'MK-102';
  if (/\/classes\/[^/]+\/enrollments\/new$/.test(path)) return 'MK-99';
  if (/\/classes\/[^/]+\/members$/.test(path)) return 'MK-98';
  if (/\/guardians\/new$/.test(path)) return 'MK-114';
  if (/\/people\/new$/.test(path) || /\/people\/[^/]+\/edit$/.test(path)) return 'MK-105';
  if (/\/people\/[^/]+$/.test(path)) return 'MK-106';
  if (/\/(courses|periods)\/new$/.test(path)) return 'MK-90';
  return 'MK-92';
}

export function WorkflowPage({
  title,
  back,
  children,
  roles = ['Manager'],
  classId,
  eyebrow = uiText.text_c4e5cf604afe,
  form = false,
  menu,
  scenario,
  classNotice = true,
  actions,
  onBack,
  overlayActive,
}: {
  title: string;
  back: string;
  children: ReactNode;
  roles?: string[];
  classId?: string;
  eyebrow?: string;
  form?: boolean;
  menu?: ReactNode;
  scenario?: string;
  classNotice?: boolean;
  actions?: ReactNode;
  onBack?: () => void;
  overlayActive?: boolean;
}) {
  const { session } = usePersonal();
  const scope = useAcademicScope();
  const path = usePathname();
  if (
    !scope.personal &&
    (session.context.workspaceType !== 'Organization' ||
      !roles.includes(session.context.activeRole ?? ''))
  )
    return <ErrorState error={new ApiError(403)} />;
  return (
    <WorkflowContext.Provider
      value={{ title, back, id: scenario ?? workflowScene(path, !!scope.personal), subtitle: '' }}
    >
      {form ? (
        classId ? (
          <ClassWorkflowGate id={classId} embedded>
            {children}
          </ClassWorkflowGate>
        ) : (
          children
        )
      ) : (
        <V5Scene
          key={scenario ?? workflowScene(path, !!scope.personal)}
          id={scenario ?? workflowScene(path, !!scope.personal)}
          title={title}
          subtitle={eyebrow}
          back={back}
          onBack={onBack}
          backWithinPage={!!onBack}
          overlayActive={overlayActive}
          actions={actions}
          layout={
            /\/(submissions|exam-submissions)\//.test(path)
              ? 'editor'
              : /\/(evaluations|grading)$/.test(path)
                ? 'table'
                : 'standard'
          }
          schoolForm
          menu={menu}
          moreLabel={menu ? uiText.v4_more : uiText.text_589d5004f227}
          onMore={
            !scope.personal
              ? () => window.dispatchEvent(new Event('makan:education-sections'))
              : undefined
          }
        >
          {classId ? (
            <ClassWorkflowGate id={classId} notice={classNotice}>
              {children}
            </ClassWorkflowGate>
          ) : (
            children
          )}
        </V5Scene>
      )}
    </WorkflowContext.Provider>
  );
}
function ClassWorkflowGate({
  id,
  children,
  embedded = false,
  notice = true,
}: {
  id: string;
  children: ReactNode;
  embedded?: boolean;
  notice?: boolean;
}) {
  const { session } = usePersonal();
  const metadata = useContext(WorkflowContext);
  const scope = useAcademicScope();
  const classes = usePersonalApi<components['schemas']['ClassResult'][]>(
    '/api/v1/academic/classes',
    { enabled: !scope.personal },
  );
  if (scope.personal) return <>{children}</>;
  if (classes.isPending) return <LoadingSkeleton />;
  if (classes.isError)
    return <ErrorState error={classes.error} onRetry={() => void classes.refetch()} />;
  const item = classes.data.find(
    (c) => c.id === id && c.organizationId === session.context.organizationId,
  );
  if (!item) return <ErrorState error={new ApiError(404)} />;
  if (embedded)
    return (
      <WorkflowContext.Provider value={{ ...metadata, subtitle: item.title }}>
        {children}
      </WorkflowContext.Provider>
    );
  return (
    <>
      {notice && (
        <p className={uiClass(r.note)}>
          {uiText.text_aee307f783b6}
          {item.title}
        </p>
      )}
      {children}
    </>
  );
}
export function useWorkflowDraft<T extends Record<string, string | boolean>>(
  scope: string,
  defaults: T,
  version = 'new',
) {
  const { session } = usePersonal();
  const academic = useAcademicScope();
  const [initial, setInitial] = useState(() => JSON.stringify(defaults));
  const draft = useTextDraft(
    `${session.user.id}:${contextSignature(session.context)}:workflow:${academic.personal?.classId ?? 'organization'}:${scope}`,
    initial,
    version,
  );
  type Values = { [K in keyof T]: T[K] extends boolean ? boolean : string };
  let values = JSON.parse(initial) as Values;
  try {
    const parsed = JSON.parse(draft.text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      values = Object.fromEntries(
        Object.entries(defaults).map(([k, v]) => [
          k,
          typeof parsed[k] === typeof v ? parsed[k] : v,
        ]),
      ) as Values;
  } catch {}
  const set = <K extends keyof T>(key: K, value: Values[K]) =>
    draft.setText((old) => {
      let previous = JSON.parse(initial);
      try {
        const parsed = JSON.parse(old);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) previous = parsed;
      } catch {}
      return JSON.stringify({ ...previous, [key]: value });
    });
  function acceptServerValues() {
    const next = JSON.stringify(defaults);
    setInitial(next);
    draft.reset(next, version);
  }
  return { ...draft, values, set, stale: draft.baseVersion !== version, acceptServerValues };
}
export function WorkflowDraftConflict({
  stale,
  onDiscard,
  focusAfterReset,
}: {
  stale: boolean;
  onDiscard: () => void;
  focusAfterReset?: () => void;
}) {
  const replaced = useRef(false);
  if (!stale) return null;
  return (
    <div role="alert">
      <p>{uiText.text_78d0088bdedd}</p>
      <ConfirmAction
        title={uiText.text_35a1c9b683d8}
        trigger={uiText.text_363bc802fb51}
        confirm={uiText.text_c36e75eccc66}
        description={uiText.text_883fc794a5da}
        onCloseAutoFocus={(event) => {
          if (replaced.current && focusAfterReset) {
            event.preventDefault();
            requestAnimationFrame(focusAfterReset);
          }
        }}
        onConfirm={async () => {
          replaced.current = true;
          onDiscard();
          return true;
        }}
      />
    </div>
  );
}
export function WorkflowForm({
  children,
  rows,
  busy,
  error,
  ready = true,
  canCommit = true,
  onSave,
  button = uiText.text_796a59104e57,
  notice,
  reviewLabel,
  menu,
  overlayActive = false,
  fieldsClassName = s.form,
}: {
  children: ReactNode;
  rows: [string, string][];
  busy: boolean;
  error?: ReactNode;
  ready?: boolean;
  canCommit?: boolean;
  onSave: () => Promise<void>;
  button?: string;
  notice?: ReactNode;
  reviewLabel?: string;
  menu?: ReactNode;
  overlayActive?: boolean;
  fieldsClassName?: string;
}) {
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams(),
    review = params.get('step') === 'review';
  const metadata = useContext(WorkflowContext);
  const sceneId =
    review && metadata.id === 'MK-92'
      ? 'MK-94'
      : review && metadata.id === 'MK-122'
        ? 'MK-123'
        : metadata.id;
  const step = (value: boolean) => {
    const q = new URLSearchParams(params);
    if (value) q.set('step', 'review');
    else q.delete('step');
    router.replace(path + (q.size ? '?' + q : ''), { scroll: false });
  };
  return (
    <V5Scene
      id={sceneId}
      kind={review ? 'article' : 'form'}
      title={
        sceneId === 'MK-94'
          ? uiText.text_adc12f54cff9
          : sceneId === 'MK-123'
            ? uiText.v5Product.reviewSession
            : metadata.title
      }
      subtitle={metadata.subtitle}
      summary={rows.map(([label, value]) => ({ label, value }))}
      schoolForm
      back={metadata.back}
      menu={menu}
      overlayActive={overlayActive}
      moreLabel={menu ? uiText.v4_more : uiText.text_589d5004f227}
      onMore={
        !path.startsWith('/personal/extracurricular')
          ? () => window.dispatchEvent(new Event('makan:education-sections'))
          : undefined
      }
      actions={
        !overlayActive && (
          <>
            {review && (
              <Button type="button" variant="outline" disabled={busy} onClick={() => step(false)}>
                {uiText.text_250a7c7f7fe9}
              </Button>
            )}
            <Button
              type="submit"
              disabled={busy || !ready || (review && !canCommit)}
              aria-busy={busy}
            >
              {review
                ? busy
                  ? uiText.text_b5ef00b1806f
                  : button
                : (reviewLabel ??
                  (metadata.id === 'MK-92'
                    ? uiText.v5Product.reviewClass
                    : metadata.id === 'MK-122'
                      ? uiText.v5Product.reviewSession
                      : metadata.id === 'MK-90'
                        ? uiText.v5SchoolForms.reviewPeriod
                        : uiText.text_4a9a328e6b5b))}
            </Button>
          </>
        )
      }
      onSubmit={(event) => {
        event.preventDefault();
        if (busy || !ready || overlayActive) return;
        if (review) {
          if (canCommit) void onSave();
        } else step(true);
      }}
    >
      {review ? (
        <>
          <div className={uiClass(r.panelTitle)}>
            <ClipboardCheck size={22} />
            <h2>{uiText.text_4a9a328e6b5b}</h2>
          </div>
          <dl className={uiClass('v5-summary')}>
            {rows.map(([name, value]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd dir="auto">{value || uiText.text_5749a86140fa}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <fieldset
          className={uiClass(fieldsClassName)}
          data-v5-workflow-fields
          disabled={busy || overlayActive}
        >
          {children}
        </fieldset>
      )}
      {notice &&
        (typeof notice === 'string' ? <p className={uiClass('policy')}>{notice}</p> : notice)}
      {error}
    </V5Scene>
  );
}
